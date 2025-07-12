
/**
 * AI Automation Force Popup Display
 * This script aggressively ensures the automation popup shows up
 */

console.log('AI Automation Force Popup: Loading...');

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        initForcePopup();
    }, 3000);
});

function initForcePopup() {
    console.log('AI Automation Force Popup: Initializing...');
    
    // Listen for ANY click in the AI automation section
    document.addEventListener('click', function(event) {
        // Check if we're in the AI automation section
        const aiSection = event.target.closest('#ai-automation-section, [data-section="ai-automation"], .ai-automation-section, .ai-automation');
        
        if (aiSection) {
            const clickedElement = event.target;
            
            // Check if it's any kind of button or clickable element
            if (clickedElement.tagName === 'BUTTON' || 
                clickedElement.classList.contains('btn') ||
                clickedElement.classList.contains('button') ||
                clickedElement.getAttribute('role') === 'button') {
                
                const text = clickedElement.textContent?.toLowerCase() || '';
                
                // If it contains automation-related keywords
                if (text.includes('create') || text.includes('automation') || text.includes('new') || text.includes('add')) {
                    console.log('AI Automation Force Popup: Automation button detected:', text);
                    
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // Force show the popup
                    forceShowPopup();
                }
            }
        }
    }, true); // Use capture phase
}

function forceShowPopup() {
    console.log('AI Automation Force Popup: Force showing popup...');
    
    // Remove any existing modal
    const existingModal = document.querySelector('.automation-path-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Create new modal
    const modal = document.createElement('div');
    modal.className = 'automation-path-modal';
    modal.style.cssText = `
        display: flex !important;
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.7) !important;
        z-index: 99999 !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    
    modal.innerHTML = `
        <div class="automation-modal-content" style="background: #252830 !important; padding: 30px !important; border-radius: 12px !important; max-width: 600px !important; width: 90% !important; max-height: 80vh !important; overflow-y: auto !important; border: 1px solid #32363f !important;">
            <div class="automation-modal-header" style="display: flex !important; justify-content: space-between !important; align-items: center !important; margin-bottom: 25px !important; border-bottom: 1px solid #32363f !important; padding-bottom: 15px !important;">
                <h2 style="color: #e0e0e0 !important; margin: 0 !important; font-size: 1.5rem !important;">Create Automation Path</h2>
                <span class="close-automation-modal" style="color: #a0a0a0 !important; font-size: 24px !important; cursor: pointer !important; padding: 5px !important;">&times;</span>
            </div>
            <div class="automation-modal-body">
                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-path-name" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Path Name</label>
                    <input type="text" id="force-path-name" placeholder="Enter automation path name" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; box-sizing: border-box !important;">
                </div>
                
                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-content-type" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Content Type</label>
                    <select id="force-content-type" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; box-sizing: border-box !important;">
                        <option value="blog-post">Blog Post</option>
                        <option value="social-media">Social Media</option>
                        <option value="newsletter">Newsletter</option>
                        <option value="product-description">Product Description</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-assistant-type" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Assistant Type</label>
                    <select id="force-assistant-type" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; box-sizing: border-box !important;">
                        <option value="creative">Creative Writer</option>
                        <option value="technical">Technical Writer</option>
                        <option value="marketing">Marketing Specialist</option>
                        <option value="general">General Assistant</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-category" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Category</label>
                    <select id="force-category" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; box-sizing: border-box !important;">
                        <option value="Recipes">Recipes</option>
                        <option value="Restaurants">Restaurants</option>
                        <option value="Health">Health</option>
                        <option value="Cooking Tips">Cooking Tips</option>
                    </select>
                </div>

                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-topics" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Topics (comma-separated)</label>
                    <textarea id="force-topics" placeholder="Enter topics separated by commas" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; min-height: 80px !important; resize: vertical !important; box-sizing: border-box !important;"></textarea>
                </div>

                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Schedule</label>
                    <div class="schedule-options" style="display: flex !important; gap: 10px !important; flex-wrap: wrap !important;">
                        <div class="schedule-option selected" data-schedule="daily" style="padding: 12px 20px !important; background: #e8f24c !important; color: #1e2127 !important; border-radius: 6px !important; cursor: pointer !important; text-align: center !important; font-weight: 500 !important; min-width: 80px !important;">
                            Daily
                        </div>
                        <div class="schedule-option" data-schedule="weekly" style="padding: 12px 20px !important; background: #32363f !important; color: #e0e0e0 !important; border-radius: 6px !important; cursor: pointer !important; text-align: center !important; font-weight: 500 !important; min-width: 80px !important;">
                            Weekly
                        </div>
                        <div class="schedule-option" data-schedule="monthly" style="padding: 12px 20px !important; background: #32363f !important; color: #e0e0e0 !important; border-radius: 6px !important; cursor: pointer !important; text-align: center !important; font-weight: 500 !important; min-width: 80px !important;">
                            Monthly
                        </div>
                    </div>
                </div>

                <div class="form-group" style="margin-bottom: 20px !important;">
                    <label for="force-schedule-time" style="display: block !important; color: #e0e0e0 !important; margin-bottom: 8px !important; font-weight: 500 !important;">Time</label>
                    <input type="time" id="force-schedule-time" value="14:00" style="width: 100% !important; padding: 12px !important; background: #2a2e36 !important; border: 1px solid #32363f !important; border-radius: 6px !important; color: #e0e0e0 !important; font-size: 14px !important; box-sizing: border-box !important;">
                </div>
            </div>
            <div class="automation-modal-footer" style="display: flex !important; gap: 15px !important; justify-content: flex-end !important; margin-top: 25px !important; padding-top: 15px !important; border-top: 1px solid #32363f !important;">
                <button class="btn btn-secondary close-automation-modal" style="padding: 12px 24px !important; background: #32363f !important; color: #e0e0e0 !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; font-size: 14px !important; font-weight: 500 !important;">Cancel</button>
                <button class="btn btn-primary save-automation-path" style="padding: 12px 24px !important; background: #e8f24c !important; color: #1e2127 !important; border: none !important; border-radius: 6px !important; cursor: pointer !important; font-size: 14px !important; font-weight: 500 !important;">Save Automation Path</button>
            </div>
        </div>
    `;
    
    // Add event listeners
    modal.addEventListener('click', function(e) {
        if (e.target.matches('.schedule-option')) {
            modal.querySelectorAll('.schedule-option').forEach(option => {
                option.style.background = '#32363f';
                option.style.color = '#e0e0e0';
                option.classList.remove('selected');
            });
            e.target.style.background = '#e8f24c';
            e.target.style.color = '#1e2127';
            e.target.classList.add('selected');
        }
        
        if (e.target.matches('.close-automation-modal')) {
            modal.remove();
        }
        
        if (e.target.matches('.save-automation-path')) {
            // Save the automation path
            const pathData = {
                id: Date.now().toString(),
                name: modal.querySelector('#force-path-name').value,
                contentType: modal.querySelector('#force-content-type').value,
                assistantType: modal.querySelector('#force-assistant-type').value,
                category: modal.querySelector('#force-category').value,
                topics: modal.querySelector('#force-topics').value,
                schedule: {
                    type: modal.querySelector('.schedule-option.selected')?.dataset.schedule || 'daily',
                    time: modal.querySelector('#force-schedule-time').value
                },
                active: true,
                lastRun: null,
                createdAt: new Date().toISOString()
            };
            
            if (pathData.name && pathData.contentType) {
                // Save to storage
                const automationPaths = JSON.parse(localStorage.getItem('aiAutomationPaths') || '[]');
                automationPaths.push(pathData);
                localStorage.setItem('aiAutomationPaths', JSON.stringify(automationPaths));
                localStorage.setItem('fooodis-ai-automation-paths', JSON.stringify(automationPaths));
                
                console.log('AI Automation Force Popup: Saved automation path:', pathData.name);
                modal.remove();
                alert('Automation path created successfully!');
            } else {
                alert('Please fill in all required fields');
            }
        }
        
        // Close modal if clicking outside
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
    
    console.log('AI Automation Force Popup: Modal created and displayed');
}

console.log('AI Automation Force Popup: Script loaded');
