
/**
 * Ready Answers Manager - Manages pre-defined chatbot responses
 */
class ReadyAnswersManager {
    constructor() {
        this.readyAnswers = [];
        this.scenarios = ['default', 'welcome', 'delivery', 'pricing', 'support'];
        this.currentEditingId = null;
    }

    async init() {
        await this.loadReadyAnswers();
        this.setupEventListeners();
        this.renderReadyAnswersSection();
    }

    async loadReadyAnswers() {
        try {
            const response = await fetch('/api/ready-answers');
            if (response.ok) {
                const result = await response.json();
                this.readyAnswers = result.answers || [];
                console.log('✅ Ready answers loaded:', this.readyAnswers.length);
            }
        } catch (error) {
            console.error('❌ Error loading ready answers:', error);
            this.readyAnswers = [];
        }
    }

    setupEventListeners() {
        // Add ready answer button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'addReadyAnswerBtn') {
                this.showReadyAnswerModal();
            }

            if (e.target.classList.contains('edit-ready-answer-btn')) {
                const answerId = e.target.dataset.answerId;
                this.editReadyAnswer(answerId);
            }

            if (e.target.classList.contains('delete-ready-answer-btn')) {
                const answerId = e.target.dataset.answerId;
                this.deleteReadyAnswer(answerId);
            }

            if (e.target.id === 'saveReadyAnswerBtn') {
                this.saveReadyAnswer();
            }

            if (e.target.id === 'cancelReadyAnswerBtn') {
                this.hideReadyAnswerModal();
            }

            if (e.target.id === 'suggestAnswerBtn') {
                this.suggestAnswerWithAI();
            }

            if (e.target.classList.contains('ready-answer-modal-backdrop')) {
                this.hideReadyAnswerModal();
            }
        });

        // Test ready answer
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('test-ready-answer-btn')) {
                const answerId = e.target.dataset.answerId;
                this.testReadyAnswer(answerId);
            }
        });
    }

    renderReadyAnswersSection() {
        // Find scenarios section and add ready answers after it
        const scenariosSection = document.querySelector('#scenarios-tab-content');
        if (!scenariosSection) return;

        // Check if ready answers section already exists
        let readyAnswersSection = document.querySelector('#ready-answers-section');
        if (!readyAnswersSection) {
            readyAnswersSection = document.createElement('div');
            readyAnswersSection.id = 'ready-answers-section';
            readyAnswersSection.className = 'ready-answers-section';
            scenariosSection.appendChild(readyAnswersSection);
        }

        readyAnswersSection.innerHTML = `
            <div class="section-header">
                <h3 class="section-subtitle">
                    <i class="fas fa-mouse-pointer"></i> Ready Answers
                </h3>
                <p class="section-description">Manage quick response buttons that appear in chat conversations</p>
                <button class="btn btn-primary" id="addReadyAnswerBtn">
                    <i class="fas fa-plus"></i> Add Ready Answer
                </button>
            </div>

            <div class="ready-answers-grid" id="readyAnswersGrid">
                ${this.renderReadyAnswersList()}
            </div>

            ${this.renderReadyAnswerModal()}
        `;
    }

    renderReadyAnswersList() {
        if (this.readyAnswers.length === 0) {
            return `
                <div class="no-ready-answers">
                    <i class="fas fa-mouse-pointer"></i>
                    <h4>No Ready Answers Yet</h4>
                    <p>Create quick response buttons to help users get instant answers</p>
                </div>
            `;
        }

        return this.readyAnswers.map(answer => `
            <div class="ready-answer-card" data-answer-id="${answer.id}">
                <div class="ready-answer-header">
                    <div class="ready-answer-labels">
                        <div class="label-pair">
                            <span class="language-flag">🇺🇸</span>
                            <span class="label-text">${answer.label_en}</span>
                        </div>
                        <div class="label-pair">
                            <span class="language-flag">🇸🇪</span>
                            <span class="label-text">${answer.label_sv}</span>
                        </div>
                    </div>
                    <div class="ready-answer-status">
                        <span class="status-badge ${answer.visible ? 'active' : 'inactive'}">
                            ${answer.visible ? 'Visible' : 'Hidden'}
                        </span>
                    </div>
                </div>

                <div class="ready-answer-content">
                    <div class="response-preview">
                        <div class="response-item">
                            <span class="response-label">🇺🇸 Response:</span>
                            <span class="response-text">${this.truncateText(answer.reply_en, 100)}</span>
                        </div>
                        <div class="response-item">
                            <span class="response-label">🇸🇪 Response:</span>
                            <span class="response-text">${this.truncateText(answer.reply_sv, 100)}</span>
                        </div>
                    </div>

                    <div class="scenario-tags">
                        <span class="scenario-label">Scenarios:</span>
                        ${answer.scenario_ids.map(id => `
                            <span class="scenario-tag">${id}</span>
                        `).join('')}
                    </div>
                </div>

                <div class="ready-answer-actions">
                    <button class="btn btn-small btn-secondary test-ready-answer-btn" 
                            data-answer-id="${answer.id}" title="Test Answer">
                        <i class="fas fa-vial"></i> Test
                    </button>
                    <button class="btn btn-small btn-secondary edit-ready-answer-btn" 
                            data-answer-id="${answer.id}" title="Edit Answer">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-small btn-danger delete-ready-answer-btn" 
                            data-answer-id="${answer.id}" title="Delete Answer">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderReadyAnswerModal() {
        return `
            <div class="ready-answer-modal" id="readyAnswerModal">
                <div class="ready-answer-modal-backdrop"></div>
                <div class="ready-answer-modal-content">
                    <div class="modal-header">
                        <h3 id="readyAnswerModalTitle">Add Ready Answer</h3>
                        <button class="modal-close-btn" id="cancelReadyAnswerBtn">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>

                    <div class="modal-body">
                        <form id="readyAnswerForm">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="labelEn">Button Label (English)</label>
                                    <input type="text" id="labelEn" name="labelEn" 
                                           placeholder="e.g., Menu, Hours, Location" required>
                                </div>
                                <div class="form-group">
                                    <label for="labelSv">Button Label (Swedish)</label>
                                    <input type="text" id="labelSv" name="labelSv" 
                                           placeholder="e.g., Meny, Öppettider, Plats" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="replyEn">Response Message (English)</label>
                                <textarea id="replyEn" name="replyEn" rows="3" 
                                          placeholder="Enter the response message in English" required></textarea>
                            </div>

                            <div class="form-group">
                                <label for="replySv">Response Message (Swedish)</label>
                                <textarea id="replySv" name="replySv" rows="3" 
                                          placeholder="Enter the response message in Swedish" required></textarea>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label for="scenarios">Scenarios</label>
                                    <select id="scenarios" name="scenarios" multiple>
                                        ${this.scenarios.map(scenario => `
                                            <option value="${scenario}">${scenario}</option>
                                        `).join('')}
                                    </select>
                                    <small>Hold Ctrl/Cmd to select multiple scenarios</small>
                                </div>
                                <div class="form-group">
                                    <label class="checkbox-label">
                                        <input type="checkbox" id="visible" name="visible" checked>
                                        <span class="checkmark"></span>
                                        Visible to users
                                    </label>
                                </div>
                            </div>

                            <div class="ai-suggestion-section">
                                <button type="button" class="btn btn-secondary" id="suggestAnswerBtn">
                                    <i class="fas fa-brain"></i> Suggest with AI
                                </button>
                                <input type="text" id="aiPrompt" placeholder="e.g., 'delivery information', 'payment methods'" 
                                       style="margin-left: 10px; flex: 1;">
                            </div>
                        </form>
                    </div>

                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancelReadyAnswerBtn">Cancel</button>
                        <button type="button" class="btn btn-primary" id="saveReadyAnswerBtn">Save Answer</button>
                    </div>
                </div>
            </div>
        `;
    }

    showReadyAnswerModal(answerId = null) {
        this.currentEditingId = answerId;
        const modal = document.getElementById('readyAnswerModal');
        const title = document.getElementById('readyAnswerModalTitle');
        
        if (answerId) {
            title.textContent = 'Edit Ready Answer';
            this.populateForm(answerId);
        } else {
            title.textContent = 'Add Ready Answer';
            this.clearForm();
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    hideReadyAnswerModal() {
        const modal = document.getElementById('readyAnswerModal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEditingId = null;
        this.clearForm();
    }

    populateForm(answerId) {
        const answer = this.readyAnswers.find(a => a.id === answerId);
        if (!answer) return;

        document.getElementById('labelEn').value = answer.label_en;
        document.getElementById('labelSv').value = answer.label_sv;
        document.getElementById('replyEn').value = answer.reply_en;
        document.getElementById('replySv').value = answer.reply_sv;
        document.getElementById('visible').checked = answer.visible;

        // Set selected scenarios
        const scenariosSelect = document.getElementById('scenarios');
        Array.from(scenariosSelect.options).forEach(option => {
            option.selected = answer.scenario_ids.includes(option.value);
        });
    }

    clearForm() {
        document.getElementById('readyAnswerForm').reset();
        document.getElementById('visible').checked = true;
    }

    async saveReadyAnswer() {
        const form = document.getElementById('readyAnswerForm');
        const formData = new FormData(form);
        
        const scenariosSelect = document.getElementById('scenarios');
        const selectedScenarios = Array.from(scenariosSelect.selectedOptions).map(option => option.value);

        const answerData = {
            label_en: formData.get('labelEn'),
            label_sv: formData.get('labelSv'),
            reply_en: formData.get('replyEn'),
            reply_sv: formData.get('replySv'),
            scenario_ids: selectedScenarios.length > 0 ? selectedScenarios : ['default'],
            visible: formData.get('visible') === 'on'
        };

        // Validate required fields
        if (!answerData.label_en || !answerData.label_sv || !answerData.reply_en || !answerData.reply_sv) {
            alert('Please fill in all required fields');
            return;
        }

        try {
            const url = this.currentEditingId 
                ? `/api/ready-answers/${this.currentEditingId}`
                : '/api/ready-answers';
            
            const method = this.currentEditingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(answerData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Ready answer saved:', result);
                
                await this.loadReadyAnswers();
                this.renderReadyAnswersSection();
                this.hideReadyAnswerModal();
                
                this.showNotification('Ready answer saved successfully!', 'success');
            } else {
                throw new Error('Failed to save ready answer');
            }
        } catch (error) {
            console.error('❌ Error saving ready answer:', error);
            this.showNotification('Error saving ready answer', 'error');
        }
    }

    async deleteReadyAnswer(answerId) {
        if (!confirm('Are you sure you want to delete this ready answer?')) return;

        try {
            const response = await fetch(`/api/ready-answers/${answerId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                await this.loadReadyAnswers();
                this.renderReadyAnswersSection();
                this.showNotification('Ready answer deleted successfully!', 'success');
            } else {
                throw new Error('Failed to delete ready answer');
            }
        } catch (error) {
            console.error('❌ Error deleting ready answer:', error);
            this.showNotification('Error deleting ready answer', 'error');
        }
    }

    editReadyAnswer(answerId) {
        this.showReadyAnswerModal(answerId);
    }

    async testReadyAnswer(answerId) {
        const answer = this.readyAnswers.find(a => a.id === answerId);
        if (!answer) return;

        // Show a preview modal or simulate in chat
        const previewHtml = `
            <div class="ready-answer-preview">
                <h4>Ready Answer Preview</h4>
                <div class="preview-buttons">
                    <button class="ready-answer-btn">🇺🇸 ${answer.label_en}</button>
                    <button class="ready-answer-btn">🇸🇪 ${answer.label_sv}</button>
                </div>
                <div class="preview-responses">
                    <div class="response-preview">
                        <strong>English Response:</strong>
                        <p>${answer.reply_en}</p>
                    </div>
                    <div class="response-preview">
                        <strong>Swedish Response:</strong>
                        <p>${answer.reply_sv}</p>
                    </div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" class="btn btn-secondary">Close</button>
            </div>
        `;

        // Create and show preview
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); z-index: 10000; display: flex;
            align-items: center; justify-content: center;
        `;
        overlay.innerHTML = previewHtml;
        document.body.appendChild(overlay);

        // Remove on backdrop click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });
    }

    async suggestAnswerWithAI() {
        const prompt = document.getElementById('aiPrompt').value.trim();
        if (!prompt) {
            alert('Please enter a prompt for AI suggestion');
            return;
        }

        try {
            const response = await fetch('/api/ready-answers/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ prompt })
            });

            if (response.ok) {
                const result = await response.json();
                const suggestion = result.suggestion;

                // Fill form with AI suggestion
                document.getElementById('labelEn').value = suggestion.label_en;
                document.getElementById('labelSv').value = suggestion.label_sv;
                document.getElementById('replyEn').value = suggestion.reply_en;
                document.getElementById('replySv').value = suggestion.reply_sv;

                this.showNotification('AI suggestion applied! Please review and adjust as needed.', 'success');
            } else {
                throw new Error('Failed to get AI suggestion');
            }
        } catch (error) {
            console.error('❌ Error getting AI suggestion:', error);
            this.showNotification('Error getting AI suggestion', 'error');
        }
    }

    truncateText(text, maxLength) {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    }

    showNotification(message, type) {
        // Use existing notification system or create simple alert
        if (window.chatbotManager && window.chatbotManager.showNotification) {
            window.chatbotManager.showNotification(message, type);
        } else {
            alert(message);
        }
    }
}

// Initialize Ready Answers Manager
window.ReadyAnswersManager = ReadyAnswersManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        window.readyAnswersManager = new ReadyAnswersManager();
        
        // Initialize when chatbot management tab is active
        const chatbotTab = document.querySelector('[data-section="chatbot-management"]');
        if (chatbotTab) {
            chatbotTab.addEventListener('click', () => {
                setTimeout(() => {
                    if (!window.readyAnswersManager.initialized) {
                        window.readyAnswersManager.init();
                        window.readyAnswersManager.initialized = true;
                    }
                }, 100);
            });
        }
    }
});
