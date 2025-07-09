/**
 * Data Persistence Diagnostic Tool for Fooodis Blog System
 * Provides tools to diagnose and fix data persistence issues
 */

// Initialize when the page is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Data Persistence Diagnostic: Initializing...');
    
    // Create the diagnostic panel
    createDiagnosticPanel();
    
    // Initialize diagnostics
    setTimeout(runDiagnostics, 1000);
});

/**
 * Create the diagnostic panel
 */
function createDiagnosticPanel() {
    // Create the panel container
    const panel = document.createElement('div');
    panel.id = 'data-persistence-panel';
    panel.style.position = 'fixed';
    panel.style.bottom = '20px';
    panel.style.right = '20px';
    panel.style.backgroundColor = '#f8f9fa';
    panel.style.border = '1px solid #dee2e6';
    panel.style.borderRadius = '5px';
    panel.style.padding = '15px';
    panel.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    panel.style.zIndex = '9999';
    panel.style.maxWidth = '400px';
    panel.style.display = 'none'; // Hidden by default
    
    // Create panel content
    panel.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
            <h3 style="margin: 0; font-size: 16px;">Data Persistence Diagnostic</h3>
            <button id="close-diagnostic-panel" style="background: none; border: none; cursor: pointer; font-size: 16px;">×</button>
        </div>
        <div id="diagnostic-results" style="margin-bottom: 15px; max-height: 200px; overflow-y: auto; font-size: 14px;">
            <p>Running diagnostics...</p>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            <button id="run-diagnostics" class="diagnostic-btn">Run Diagnostics</button>
            <button id="force-reload-data" class="diagnostic-btn">Force Reload Data</button>
            <button id="clear-all-data" class="diagnostic-btn">Clear All Data</button>
        </div>
    `;
    
    // Add styles for buttons
    const style = document.createElement('style');
    style.textContent = `
        .diagnostic-btn {
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 3px;
            padding: 5px 10px;
            cursor: pointer;
            font-size: 14px;
        }
        .diagnostic-btn:hover {
            background-color: #0069d9;
        }
    `;
    document.head.appendChild(style);
    
    // Add the panel to the document
    document.body.appendChild(panel);
    
    // Add event listeners
    document.getElementById('close-diagnostic-panel').addEventListener('click', function() {
        panel.style.display = 'none';
    });
    
    document.getElementById('run-diagnostics').addEventListener('click', runDiagnostics);
    document.getElementById('force-reload-data').addEventListener('click', forceReloadData);
    document.getElementById('clear-all-data').addEventListener('click', clearAllData);
    
    // Add keyboard shortcut (Ctrl+Shift+D) to toggle the panel
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.shiftKey && e.key === 'D') {
            toggleDiagnosticPanel();
            e.preventDefault();
        }
    });
    
    console.log('Data Persistence Diagnostic: Panel created');
}

/**
 * Toggle the diagnostic panel visibility
 */
function toggleDiagnosticPanel() {
    const panel = document.getElementById('data-persistence-panel');
    if (panel) {
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        if (panel.style.display === 'block') {
            runDiagnostics();
        }
    }
}

/**
 * Run diagnostics on data persistence
 */
function runDiagnostics() {
    console.log('Data Persistence Diagnostic: Running diagnostics...');
    
    const resultsDiv = document.getElementById('diagnostic-results');
    if (!resultsDiv) return;
    
    resultsDiv.innerHTML = '<p>Running diagnostics...</p>';
    
    // Check if localStorage is available
    const localStorageAvailable = testLocalStorage();
    
    let results = `<p><strong>Storage Availability:</strong></p>
        <p>localStorage: ${localStorageAvailable ? '✅ Available' : '❌ Not available'}</p>
        <p>sessionStorage: ${typeof sessionStorage !== 'undefined' ? '✅ Available' : '❌ Not available'}</p>
        <p>StorageManager: ${typeof window.StorageManager !== 'undefined' ? '✅ Available' : '❌ Not available'}</p>`;
    
    // Check OpenAI API Key
    results += `<p><strong>OpenAI API Key:</strong></p>`;
    
    try {
        const directConfig = localStorage.getItem('aiConfig');
        const parsedConfig = directConfig ? JSON.parse(directConfig) : null;
        const apiKey = parsedConfig && parsedConfig.apiKey ? parsedConfig.apiKey.substring(0, 5) + '...' : 'Not found';
        
        results += `<p>localStorage (aiConfig): ${apiKey !== 'Not found' ? '✅ Found' : '❌ Not found'}</p>`;
    } catch (e) {
        results += `<p>localStorage (aiConfig): ❌ Error: ${e.message}</p>`;
    }
    
    try {
        const prefixedConfig = localStorage.getItem('fooodis-ai-config');
        const parsedConfig = prefixedConfig ? JSON.parse(prefixedConfig) : null;
        const apiKey = parsedConfig && parsedConfig.apiKey ? parsedConfig.apiKey.substring(0, 5) + '...' : 'Not found';
        
        results += `<p>localStorage (fooodis-ai-config): ${apiKey !== 'Not found' ? '✅ Found' : '❌ Not found'}</p>`;
    } catch (e) {
        results += `<p>localStorage (fooodis-ai-config): ❌ Error: ${e.message}</p>`;
    }
    
    // Check window.aiConfig
    results += `<p>window.aiConfig: ${window.aiConfig && window.aiConfig.apiKey ? '✅ Found' : '❌ Not found'}</p>`;
    
    // Check Automation Paths
    results += `<p><strong>Automation Paths:</strong></p>`;
    
    try {
        const directPaths = localStorage.getItem('aiAutomationPaths');
        const parsedPaths = directPaths ? JSON.parse(directPaths) : null;
        const pathCount = parsedPaths && Array.isArray(parsedPaths) ? parsedPaths.length : 0;
        
        results += `<p>localStorage (aiAutomationPaths): ${pathCount > 0 ? `✅ Found ${pathCount} paths` : '❌ Not found'}</p>`;
        
        // Show details of the paths if found
        if (pathCount > 0) {
            results += `<p><details><summary>Path Details (click to expand)</summary><pre style="max-height: 150px; overflow-y: auto; font-size: 12px;">${JSON.stringify(parsedPaths, null, 2)}</pre></details></p>`;
        }
    } catch (e) {
        results += `<p>localStorage (aiAutomationPaths): ❌ Error: ${e.message}</p>`;
    }
    
    try {
        const prefixedPaths = localStorage.getItem('fooodis-ai-automation-paths');
        const parsedPaths = prefixedPaths ? JSON.parse(prefixedPaths) : null;
        const pathCount = parsedPaths && Array.isArray(parsedPaths) ? parsedPaths.length : 0;
        
        results += `<p>localStorage (fooodis-ai-automation-paths): ${pathCount > 0 ? `✅ Found ${pathCount} paths` : '❌ Not found'}</p>`;
    } catch (e) {
        results += `<p>localStorage (fooodis-ai-automation-paths): ❌ Error: ${e.message}</p>`;
    }
    
    // Check sessionStorage
    try {
        const sessionPaths = sessionStorage.getItem('aiAutomationPaths');
        const parsedPaths = sessionPaths ? JSON.parse(sessionPaths) : null;
        const pathCount = parsedPaths && Array.isArray(parsedPaths) ? parsedPaths.length : 0;
        
        results += `<p>sessionStorage (aiAutomationPaths): ${pathCount > 0 ? `✅ Found ${pathCount} paths` : '❌ Not found'}</p>`;
    } catch (e) {
        results += `<p>sessionStorage (aiAutomationPaths): ❌ Error: ${e.message}</p>`;
    }
    
    // Check window.automationPaths
    const windowPathCount = window.automationPaths && Array.isArray(window.automationPaths) ? window.automationPaths.length : 0;
    results += `<p>window.automationPaths: ${windowPathCount > 0 ? `✅ Found ${windowPathCount} paths` : '❌ Not found'}</p>`;
    
    // Check in-progress paths
    try {
        const inProgress = localStorage.getItem('aiAutomationInProgress');
        const parsedInProgress = inProgress ? JSON.parse(inProgress) : null;
        const inProgressCount = parsedInProgress && Array.isArray(parsedInProgress) ? parsedInProgress.length : 0;
        
        results += `<p>In-Progress Paths: ${inProgressCount > 0 ? `✅ Found ${inProgressCount} in-progress paths` : '❌ None found'}</p>`;
        
        if (inProgressCount > 0) {
            results += `<p><details><summary>In-Progress Details</summary><pre style="max-height: 100px; overflow-y: auto; font-size: 12px;">${JSON.stringify(parsedInProgress, null, 2)}</pre></details></p>`;
        }
    } catch (e) {
        results += `<p>In-Progress Paths: ❌ Error: ${e.message}</p>`;
    }
    
    // Check blog posts
    try {
        const blogPosts = localStorage.getItem('fooodis-blog-posts');
        const parsedPosts = blogPosts ? JSON.parse(blogPosts) : null;
        const postCount = parsedPosts && Array.isArray(parsedPosts) ? parsedPosts.length : 0;
        
        results += `<p><strong>Blog Posts:</strong> ${postCount > 0 ? `✅ Found ${postCount} posts` : '❌ No posts found'}</p>`;
        
        if (postCount > 0) {
            results += `<p><details><summary>Latest Post</summary><pre style="max-height: 100px; overflow-y: auto; font-size: 12px;">${JSON.stringify(parsedPosts[0], null, 2)}</pre></details></p>`;
        }
    } catch (e) {
        results += `<p>Blog Posts: ❌ Error: ${e.message}</p>`;
    }
    
    // Update the results
    resultsDiv.innerHTML = results;
    console.log('Data Persistence Diagnostic: Diagnostics completed');
}

/**
 * Test if localStorage is available
 * @returns {boolean} Whether localStorage is available
 */
function testLocalStorage() {
    try {
        const testKey = 'test-local-storage';
        localStorage.setItem(testKey, 'test');
        const testValue = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        return testValue === 'test';
    } catch (e) {
        console.error('localStorage is not available:', e);
        return false;
    }
}

/**
 * Force reload all data from storage
 */
function forceReloadData() {
    console.log('Data Persistence Diagnostic: Forcing data reload...');
    
    const resultsElement = document.getElementById('diagnostic-results');
    if (resultsElement) {
        resultsElement.innerHTML = '<p>Forcing data reload...</p>';
    }
    
    // Reload API configuration
    try {
        if (typeof window.loadAndApplyConfig === 'function') {
            window.loadAndApplyConfig();
        } else if (typeof loadAndApplyConfig === 'function') {
            loadAndApplyConfig();
        }
    } catch (e) {
        console.error('Error reloading API configuration:', e);
    }
    
    // Reload automation paths
    try {
        if (typeof window.loadAutomationPaths === 'function') {
            window.loadAutomationPaths();
        } else if (typeof loadAutomationPaths === 'function') {
            loadAutomationPaths();
        }
        
        // Re-render automation paths
        if (typeof window.renderAutomationPaths === 'function') {
            window.renderAutomationPaths();
        } else if (typeof renderAutomationPaths === 'function') {
            renderAutomationPaths();
        }
    } catch (e) {
        console.error('Error reloading automation paths:', e);
    }
    
    // Run diagnostics again to verify
    setTimeout(runDiagnostics, 500);
    
    // Show success message
    if (resultsElement) {
        resultsElement.innerHTML += '<p style="color: green;">Data reload initiated. Refreshing diagnostics...</p>';
    }
}

/**
 * Clear all stored data
 */
function clearAllData() {
    console.log('Data Persistence Diagnostic: Clearing all data...');
    
    const resultsElement = document.getElementById('diagnostic-results');
    if (resultsElement) {
        resultsElement.innerHTML = '<p>Clearing all data...</p>';
    }
    
    // Clear localStorage
    try {
        // Clear direct keys
        localStorage.removeItem('aiConfig');
        localStorage.removeItem('aiAutomationPaths');
        
        // Clear prefixed keys
        localStorage.removeItem('fooodis-aiConfig');
        localStorage.removeItem('fooodis-ai-automation-paths');
        
        // Clear StorageManager keys
        if (window.StorageManager && typeof window.StorageManager.remove === 'function') {
            window.StorageManager.remove('ai-config');
            window.StorageManager.remove('ai-automation-paths');
        }
        
        // Clear sessionStorage
        sessionStorage.removeItem('aiConfig');
        sessionStorage.removeItem('aiAutomationPaths');
        
        // Reset window objects
        window.aiConfig = {
            apiKey: '',
            model: 'gpt-4',
            customAssistants: [],
            assistant: 'default',
            customAssistant: {
                id: '',
                name: '',
                instructions: ''
            }
        };
        
        window.automationPaths = [];
        
        // Update UI if functions exist
        if (typeof window.renderAutomationPaths === 'function') {
            window.renderAutomationPaths();
        } else if (typeof renderAutomationPaths === 'function') {
            renderAutomationPaths();
        }
        
        if (typeof window.applyConfigToForm === 'function') {
            window.applyConfigToForm(window.aiConfig);
        } else if (typeof applyConfigToForm === 'function') {
            applyConfigToForm(window.aiConfig);
        }
        
        // Show success message
        if (resultsElement) {
            resultsElement.innerHTML = '<p style="color: green;">All data cleared successfully!</p>';
        }
        
        // Run diagnostics again to verify
        setTimeout(runDiagnostics, 500);
    } catch (e) {
        console.error('Error clearing data:', e);
        if (resultsElement) {
            resultsElement.innerHTML = `<p style="color: red;">Error clearing data: ${e.message}</p>`;
        }
    }
}

// Add global access to diagnostic functions
window.dataPersistenceDiagnostic = {
    togglePanel: toggleDiagnosticPanel,
    runDiagnostics: runDiagnostics,
    forceReloadData: forceReloadData,
    clearAllData: clearAllData
};

// Log initialization
console.log('Data Persistence Diagnostic: Initialized');
