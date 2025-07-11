
/**
 * Force V2 Section Display System
 * Ensures V2 chatbot sections are properly displayed and integrated
 */

class ForceV2Section {
    constructor() {
        this.v2Sections = [
            'scenarios-panel',
            'node-flow-container', 
            'chatbot-scenarios',
            'visual-flow-builder'
        ];
        this.init();
    }

    init() {
        console.log('🔄 Force V2 Section: Initializing...');
        this.ensureV2Sections();
        this.setupV2EventHandlers();
        this.forceV2Display();
        this.integrateWithChatbotManager();
    }

    ensureV2Sections() {
        this.v2Sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                // Force display and proper styling
                section.style.display = 'block';
                section.style.visibility = 'visible';
                section.style.opacity = '1';
                section.classList.add('v2-section-active');
                console.log(`✅ Force V2: Section ${sectionId} activated`);
            } else {
                console.warn(`⚠️ Force V2: Section ${sectionId} not found`);
            }
        });
    }

    forceV2Display() {
        // Force scenarios tab to show V2 flow builder
        const scenariosTab = document.querySelector('[data-tab="scenarios"]');
        if (scenariosTab) {
            scenariosTab.addEventListener('click', () => {
                setTimeout(() => {
                    this.showV2FlowBuilder();
                }, 100);
            });
        }

        // Auto-show V2 flow builder if on scenarios tab
        if (window.location.hash === '#scenarios' || 
            document.querySelector('.chatbot-tab[data-tab="scenarios"]')?.classList.contains('active')) {
            this.showV2FlowBuilder();
        }
    }

    showV2FlowBuilder() {
        console.log('🎯 Force V2: Showing flow builder...');
        
        // Hide legacy scenarios
        const legacyScenarios = document.getElementById('legacy-scenarios');
        if (legacyScenarios) {
            legacyScenarios.style.display = 'none';
        }

        // Show V2 flow builder
        const nodeFlowContainer = document.getElementById('node-flow-container');
        if (nodeFlowContainer) {
            nodeFlowContainer.style.display = 'block';
            nodeFlowContainer.style.minHeight = '600px';
            
            // Initialize Node Flow Builder if not already done
            if (typeof NodeFlowBuilder !== 'undefined' && !window.nodeFlowBuilder) {
                this.initializeNodeFlowBuilder();
            }
        }

        // Show toolbar
        const toolbar = document.getElementById('node-flow-toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
    }

    initializeNodeFlowBuilder() {
        try {
            console.log('🎯 Force V2: Initializing Node Flow Builder...');
            window.nodeFlowBuilder = new NodeFlowBuilder('node-flow-container');
            
            // Connect with chatbot manager
            if (window.chatbotManager) {
                window.chatbotManager.nodeFlowBuilder = window.nodeFlowBuilder;
                console.log('✅ Force V2: Node Flow Builder connected to ChatbotManager');
            }
            
            this.showNotification('Visual Flow Builder initialized!', 'success');
        } catch (error) {
            console.error('❌ Force V2: Error initializing Node Flow Builder:', error);
            this.showNotification('Error initializing flow builder', 'error');
        }
    }

    setupV2EventHandlers() {
        // Listen for chatbot manager initialization
        document.addEventListener('chatbotManagerReady', () => {
            console.log('🔄 Force V2: ChatbotManager ready, integrating...');
            this.integrateWithChatbotManager();
        });

        // Handle tab switches
        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-tab="scenarios"]')) {
                setTimeout(() => this.showV2FlowBuilder(), 100);
            }
        });
    }

    integrateWithChatbotManager() {
        if (window.chatbotManager) {
            // Add method to get node flow data
            window.chatbotManager.getNodeFlowData = () => {
                if (window.nodeFlowBuilder) {
                    return {
                        nodes: window.nodeFlowBuilder.nodes,
                        connections: window.nodeFlowBuilder.connections,
                        currentLanguage: window.nodeFlowBuilder.currentLanguage
                    };
                }
                return null;
            };

            // Add method to update node flow
            window.chatbotManager.updateNodeFlow = (flowData) => {
                if (window.nodeFlowBuilder && flowData) {
                    window.nodeFlowBuilder.nodes = flowData.nodes || [];
                    window.nodeFlowBuilder.connections = flowData.connections || [];
                    if (flowData.currentLanguage) {
                        window.nodeFlowBuilder.currentLanguage = flowData.currentLanguage;
                    }
                    window.nodeFlowBuilder.renderNodes();
                    window.nodeFlowBuilder.renderConnections();
                }
            };

            console.log('✅ Force V2: Integration with ChatbotManager completed');
        }
    }

    // Add methods to support chatbot integration
    window.nodeFlowBuilder.getWelcomeNode = function() {
        console.log('🎯 Looking for welcome node in flow...');
        
        // Look for the first node in the flow (should be welcome/start node)
        const welcomeNode = this.nodes.find(node => {
            // Check if it's a start node or has no incoming connections
            const hasIncoming = this.connections.some(conn => conn.to === node.id);
            return !hasIncoming || node.type === 'start' || node.title.toLowerCase().includes('welcome');
        });

        if (welcomeNode) {
            console.log('🎯 Found welcome node:', welcomeNode.title);
            return {
                id: welcomeNode.id,
                title: welcomeNode.title,
                message: welcomeNode.message || '',
                aiMode: welcomeNode.aiMode || false,
                assistantId: welcomeNode.assistantId || null,
                aiPrompt: welcomeNode.aiPrompt || ''
            };
        }

        console.log('❌ No welcome node found');
        return null;
    };

    window.nodeFlowBuilder.getCurrentNode = function() {
        console.log('🎯 Getting current active node...');
        
        // For now, return the welcome node as the current node
        // In a more complex implementation, this would track conversation state
        return this.getWelcomeNode();
    };

    console.log('✅ Force V2: Chatbot integration methods added');plete');
        }
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            border-radius: 4px;
            z-index: 10000;
            font-weight: 500;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.forceV2Section = new ForceV2Section();
    });
} else {
    window.forceV2Section = new ForceV2Section();
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForceV2Section;
}
