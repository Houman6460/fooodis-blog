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
        const scenariosTab = document.querySelector('[data-tab="scenarios"]');
        if (scenariosTab) {
            scenariosTab.addEventListener('click', () => {
                setTimeout(() => {
                    this.showV2FlowBuilder();
                }, 100);
            });
        }

        if (window.location.hash === '#scenarios' || 
            document.querySelector('.chatbot-tab[data-tab="scenarios"]')?.classList.contains('active')) {
            this.showV2FlowBuilder();
        }
    }

    showV2FlowBuilder() {
        console.log('🎯 Force V2: Showing flow builder...');

        const legacyScenarios = document.getElementById('legacy-scenarios');
        if (legacyScenarios) {
            legacyScenarios.style.display = 'none';
        }

        const nodeFlowContainer = document.getElementById('node-flow-container');
        if (nodeFlowContainer) {
            nodeFlowContainer.style.display = 'block';
            nodeFlowContainer.style.minHeight = '600px';

            if (typeof NodeFlowBuilder !== 'undefined' && !window.nodeFlowBuilder) {
                this.initializeNodeFlowBuilder();
            }
        }

        const toolbar = document.getElementById('node-flow-toolbar');
        if (toolbar) {
            toolbar.style.display = 'flex';
        }
    }

    initializeNodeFlowBuilder() {
        try {
            console.log('🎯 Force V2: Initializing Node Flow Builder...');
            window.nodeFlowBuilder = new NodeFlowBuilder('node-flow-container');

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
        document.addEventListener('chatbotManagerReady', () => {
            console.log('🔄 Force V2: ChatbotManager ready, integrating...');
            this.integrateWithChatbotManager();
        });

        document.addEventListener('click', (e) => {
            if (e.target.closest('[data-tab="scenarios"]')) {
                setTimeout(() => this.showV2FlowBuilder(), 100);
            }
        });
    }

    integrateWithChatbotManager() {
        if (window.chatbotManager) {
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

    showNotification(message, type = 'info') {
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

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.forceV2Section = new ForceV2Section();
    });
} else {
    window.forceV2Section = new ForceV2Section();
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForceV2Section;
}