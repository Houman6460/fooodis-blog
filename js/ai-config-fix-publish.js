/**
 * AI Configuration Fix for Publishing Issues
 */

console.log('AI Config Fix: Loading...');

// Ensure AI config is properly initialized
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Config Fix: DOM loaded, initializing...');

    // Wait a bit for other scripts to load
    setTimeout(() => {
        initializeAIConfigFix();
    }, 500);
});

function initializeAIConfigFix() {
    console.log('AI Config Fix: Initializing...');

    // Fix connection test button - try multiple possible IDs
    const testBtn = document.getElementById('test-connection-btn') || 
                   document.getElementById('testConnection') ||
                   document.querySelector('button[onclick*="test"]') ||
                   document.querySelector('.test-btn');

    if (testBtn) {
        // Remove existing listeners
        testBtn.removeEventListener('click', handleConnectionTest);
        testBtn.addEventListener('click', handleConnectionTest);
        console.log('AI Config Fix: Test button event listener added');
    } else {
        console.warn('AI Config Fix: Test button not found, creating one...');
        createTestButton();
    }

    // Fix save button - try multiple possible IDs
    const saveBtn = document.getElementById('save-ai-config') || 
                   document.getElementById('saveAIConfig') ||
                   document.getElementById('saveConfiguration') ||
                   document.querySelector('button[onclick*="save"]') ||
                   document.querySelector('.save-btn');

    if (saveBtn) {
        // Remove existing listeners
        saveBtn.removeEventListener('click', handleSaveConfig);
        saveBtn.addEventListener('click', handleSaveConfig);
        console.log('AI Config Fix: Save button event listener added');
    } else {
        console.warn('AI Config Fix: Save button not found, creating one...');
        createSaveButton();
    }

    // Load saved configuration
    loadAIConfiguration();
}

function createTestButton() {
    const configSection = document.getElementById('ai-config-section');
    if (!configSection) return;

    const testBtn = document.createElement('button');
    testBtn.id = 'test-connection-btn';
    testBtn.className = 'test-btn';
    testBtn.textContent = 'Test Connection';
    testBtn.style.cssText = `
        background: transparent;
        color: var(--primary-color, #e8f24c);
        border: 1px solid var(--primary-color, #e8f24c);
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px 5px;
        transition: all 0.2s;
    `;

    testBtn.addEventListener('click', handleConnectionTest);

    // Add after the API key input
    const apiKeyInput = document.getElementById('openai-api-key') || 
                       document.getElementById('openaiApiKey') ||
                       document.querySelector('input[placeholder*="API"]');

    if (apiKeyInput && apiKeyInput.parentNode) {
        apiKeyInput.parentNode.appendChild(testBtn);
    } else {
        configSection.appendChild(testBtn);
    }

    console.log('AI Config Fix: Created test button');
}

function createSaveButton() {
    const configSection = document.getElementById('ai-config-section');
    if (!configSection) return;

    const saveBtn = document.createElement('button');
    saveBtn.id = 'save-ai-config';
    saveBtn.className = 'save-btn';
    saveBtn.textContent = 'Save Configuration';
    saveBtn.style.cssText = `
        background: var(--primary-color, #e8f24c);
        color: var(--secondary-color, #1e2127);
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin: 10px 5px;
        font-weight: 500;
        transition: all 0.2s;
    `;

    saveBtn.addEventListener('click', handleSaveConfig);
    configSection.appendChild(saveBtn);

    console.log('AI Config Fix: Created save button');
}

async function handleConnectionTest(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log('AI Config Fix: Testing connection...');

    const apiKeyInput = document.getElementById('openai-api-key') || 
                       document.getElementById('openaiApiKey') ||
                       document.querySelector('input[placeholder*="API"]');

    if (!apiKeyInput) {
        showStatus('error', 'API key input not found');
        return;
    }

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showStatus('error', 'Please enter an API key');
        return;
    }

    if (!apiKey.startsWith('sk-')) {
        showStatus('error', 'Invalid API key format. OpenAI keys start with "sk-"');
        return;
    }

    showStatus('testing', 'Testing connection...');

    try {
        // Test with OpenAI API directly
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                showStatus('success', `Connection successful! Found ${data.data.length} models available.`);
                return true;
            } else {
                showStatus('error', 'API key is invalid or has no access to models');
                return false;
            }
        } else {
            const errorData = await response.json().catch(() => ({}));
            showStatus('error', `Connection failed: ${errorData.error?.message || response.statusText}`);
            return false;
        }

    } catch (error) {
        console.error('Connection test error:', error);
        showStatus('error', 'Connection test failed: ' + error.message);
        return false;
    }
}

async function handleSaveConfig(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    console.log('AI Config Fix: Saving configuration...');

    const apiKeyInput = document.getElementById('openai-api-key') || 
                       document.getElementById('openaiApiKey') ||
                       document.querySelector('input[placeholder*="API"]');

    if (!apiKeyInput) {
        showStatus('error', 'API key input not found');
        return;
    }

    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
        showStatus('error', 'Please enter an API key');
        return;
    }

    // Test connection first
    showStatus('testing', 'Validating API key...');

    const connectionValid = await handleConnectionTest();
    if (!connectionValid) {
        showStatus('error', 'Cannot save invalid API key');
        return;
    }

    try {
        // Save to multiple storage locations
        const config = {
            apiKey: apiKey,
            timestamp: Date.now(),
            validated: true
        };

        // Save to localStorage with multiple keys
        localStorage.setItem('aiConfig', JSON.stringify(config));
        localStorage.setItem('fooodis-aiConfig', JSON.stringify(config));
        localStorage.setItem('openai-api-key', apiKey);

        // Save via StorageManager if available
        if (typeof StorageManager !== 'undefined') {
            StorageManager.save('ai-config', config);
        }

        // Save to sessionStorage as backup
        sessionStorage.setItem('aiConfig-backup', JSON.stringify(config));

        // Update global config if available
        if (typeof window.aiConfig !== 'undefined') {
            window.aiConfig.apiKey = apiKey;
        }

        showStatus('success', 'Configuration saved and validated successfully!');

        console.log('✅ AI Configuration saved successfully');

        // Verify the save worked
        const verification = localStorage.getItem('aiConfig');
        if (!verification) {
            console.warn('Configuration save verification failed');
            showStatus('error', 'Save verification failed');
        }

    } catch (error) {
        console.error('Save config error:', error);
        showStatus('error', 'Failed to save configuration: ' + error.message);
    }
}

function loadAIConfiguration() {
    try {
        let config = null;

        // Try multiple storage locations
        const savedConfig = localStorage.getItem('aiConfig');
        if (savedConfig) {
            config = JSON.parse(savedConfig);
        }

        // Try StorageManager if available
        if (!config && typeof StorageManager !== 'undefined') {
            config = StorageManager.get('ai-config');
        }

        // Try alternative key
        if (!config) {
            const altConfig = localStorage.getItem('fooodis-aiConfig');
            if (altConfig) {
                config = JSON.parse(altConfig);
            }
        }

        // Try direct API key storage
        if (!config) {
            const directKey = localStorage.getItem('openai-api-key');
            if (directKey) {
                config = { apiKey: directKey };
            }
        }

        if (config && config.apiKey) {
            const apiKeyInput = document.getElementById('openai-api-key') || 
                               document.getElementById('openaiApiKey') ||
                               document.querySelector('input[placeholder*="API"]');

            if (apiKeyInput) {
                apiKeyInput.value = config.apiKey;
                console.log('AI Config Fix: Loaded saved API key');
            }

            // Update global config if available
            if (typeof window.aiConfig !== 'undefined') {
                window.aiConfig.apiKey = config.apiKey;
            }
        }

    } catch (error) {
        console.error('Error loading AI configuration:', error);
    }
}

function showStatus(type, message) {
    let statusElement = document.getElementById('connection-status');

    // Create status element if it doesn't exist
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'connection-status';
        statusElement.className = 'status';

        // Find a good place to insert it
        const configSection = document.getElementById('ai-config-section');
        const testButton = document.getElementById('test-connection-btn');
        const configForm = document.querySelector('.ai-config-form');

        if (testButton && testButton.parentNode) {
            testButton.parentNode.insertBefore(statusElement, testButton.nextSibling);
        } else if (configForm) {
            configForm.appendChild(statusElement);
        } else if (configSection) {
            configSection.appendChild(statusElement);
        } else {
            document.body.appendChild(statusElement);
        }
    }

    statusElement.className = `status ${type}`;
    statusElement.textContent = message;
    statusElement.style.display = 'block';
    statusElement.style.padding = '10px';
    statusElement.style.margin = '10px 0';
    statusElement.style.borderRadius = '4px';
    statusElement.style.fontSize = '14px';
    statusElement.style.fontWeight = '500';
    statusElement.style.zIndex = '1000';

    // Style based on type
    switch(type) {
        case 'success':
            statusElement.style.backgroundColor = '#d4edda';
            statusElement.style.color = '#155724';
            statusElement.style.border = '1px solid #c3e6cb';
            break;
        case 'error':
            statusElement.style.backgroundColor = '#f8d7da';
            statusElement.style.color = '#721c24';
            statusElement.style.border = '1px solid #f5c6cb';
            break;
        case 'testing':
            statusElement.style.backgroundColor = '#d1ecf1';
            statusElement.style.color = '#0c5460';
            statusElement.style.border = '1px solid #bee5eb';
            break;
        default:
            statusElement.style.backgroundColor = '#e2e3e5';
            statusElement.style.color = '#383d41';
            statusElement.style.border = '1px solid #d6d8db';
    }

    // Hide status after 5 seconds for success/error
    if (type !== 'testing') {
        setTimeout(() => {
            if (statusElement && statusElement.style.display !== 'none') {
                statusElement.style.display = 'none';
            }
        }, 5000);
    }
}

// Export functions for global access
window.handleConnectionTest = handleConnectionTest;
window.handleSaveConfig = handleSaveConfig;
window.testConnection = handleConnectionTest;
window.saveConfiguration = handleSaveConfig;

console.log('AI Config Fix: Script loaded');