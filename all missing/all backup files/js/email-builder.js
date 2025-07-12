/**
 * Email Builder - Drag and Drop Email Designer
 * A comprehensive email building system for the Fooodis Blog platform
 */

const EmailBuilder = {
    // Store for the active element being edited
    activeElement: null,
    
    // Store for drag and drop operations
    dragData: {
        source: null,
        target: null,
        elementType: null,
        isDragging: false
    },
    
    // Brand color palette system (internal, doesn't affect UI)
    _colorPalette: {
        primary: '#4e73df',
        secondary: '#f6c23e',
        success: '#1cc88a',
        danger: '#e74a3b',
        warning: '#f6c23e',
        info: '#36b9cc',
        light: '#f8f9fc',
        dark: '#5a5c69',
        muted: '#858796'
    },
    
    // Initialize the Email Builder
    init() {
        console.log('Initializing Email Builder...');
        try {
            // Load saved palette settings first (doesn't affect UI)
            this._loadPaletteSettings();
            
            this.setupEmailProviderIntegration();
            this.setupElementsLibrary();
            this.setupEmailCanvas();
            this.setupSettingsPanels();
            this.setupPreviewControls();
            this.setupActionButtons();
            this.setupDragAndDropFunctionality();
            console.log('Email Builder initialized successfully');
        } catch (error) {
            console.error('Error initializing Email Builder:', error);
        }
    },
    
    // Setup Email Provider Integration
    setupEmailProviderIntegration() {
        // Create email provider connection panel if it doesn't exist
        const settingsTab = document.getElementById('settings-tab');
        if (!settingsTab) return;
        
        const providerSection = document.createElement('div');
        providerSection.className = 'settings-section email-provider-section';
        providerSection.innerHTML = `
            <h4>Email Service Provider</h4>
            <div class="provider-selection">
                <div class="form-group">
                    <label>Select Provider:</label>
                    <select id="email-provider-select" class="form-control">
                        <option value="mailchimp">Mailchimp</option>
                        <option value="sendgrid">SendGrid</option>
                        <option value="constant-contact">Constant Contact</option>
                        <option value="campaign-monitor">Campaign Monitor</option>
                        <option value="custom">Custom SMTP</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>API Key / Token:</label>
                    <input type="password" id="provider-api-key" class="form-control" placeholder="Enter your API key">
                </div>
                
                <div id="custom-smtp-fields" style="display:none;">
                    <div class="form-group">
                        <label>SMTP Server:</label>
                        <input type="text" id="smtp-server" class="form-control" placeholder="smtp.yourdomain.com">
                    </div>
                    <div class="form-group">
                        <label>SMTP Port:</label>
                        <input type="number" id="smtp-port" class="form-control" placeholder="587">
                    </div>
                    <div class="form-group">
                        <label>Username:</label>
                        <input type="text" id="smtp-username" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>Password:</label>
                        <input type="password" id="smtp-password" class="form-control">
                    </div>
                </div>
                
                <button id="connect-provider-btn" class="btn btn-primary">Connect Provider</button>
                <div id="connection-status" class="connection-status">Not connected</div>
            </div>
        `;
        
        // Find the right place to insert it in the settings tab
        const settingsContainer = settingsTab.querySelector('.settings-container .settings-content');
        if (settingsContainer) {
            settingsContainer.insertBefore(providerSection, settingsContainer.firstChild);
            
            // Add event listener for provider selection
            const providerSelect = document.getElementById('email-provider-select');
            const customSmtpFields = document.getElementById('custom-smtp-fields');
            
            if (providerSelect && customSmtpFields) {
                providerSelect.addEventListener('change', () => {
                    if (providerSelect.value === 'custom') {
                        customSmtpFields.style.display = 'block';
                    } else {
                        customSmtpFields.style.display = 'none';
                    }
                });
            }
            
            // Add event listener for connect button
            const connectBtn = document.getElementById('connect-provider-btn');
            const connectionStatus = document.getElementById('connection-status');
            
            if (connectBtn && connectionStatus) {
                connectBtn.addEventListener('click', () => {
                    connectionStatus.textContent = 'Connecting...';
                    connectionStatus.className = 'connection-status connecting';
                    
                    // Simulate connection process
                    setTimeout(() => {
                        connectionStatus.textContent = 'Connected successfully';
                        connectionStatus.className = 'connection-status connected';
                        this.saveProviderSettings();
                    }, 1500);
                });
            }
        }
    },
    
    // Save provider settings
    saveProviderSettings() {
        const provider = document.getElementById('email-provider-select')?.value;
        const apiKey = document.getElementById('provider-api-key')?.value;
        
        if (provider && apiKey) {
            // Save to localStorage for persistence
            localStorage.setItem('emailProvider', provider);
            localStorage.setItem('emailProviderKey', btoa(apiKey)); // Simple encoding, not secure
            
            console.log(`Email provider ${provider} connected successfully`);
            return true;
        }
        
        return false;
    },
    
    // Set up the tab navigation for the email marketing section
    setupTabNavigation() {
        const tabs = document.querySelectorAll('.email-marketing-tabs .tab');
        const tabContents = document.querySelectorAll('.email-marketing-tab-content');
        
        // Load previously active tab from localStorage or default to 'campaigns'
        const activeTab = localStorage.getItem('activeEmailMarketingTab') || 'campaigns';
        
        // Set active tab
        this.setActiveTab(activeTab, tabs, tabContents);
        
        // Add click event listeners to tabs
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-tab');
                this.setActiveTab(tabName, tabs, tabContents);
                localStorage.setItem('activeEmailMarketingTab', tabName);
            });
        });
    },
    
    // Set the active tab
    setActiveTab(tabName, tabs, tabContents) {
        // Remove active class from all tabs and contents
        tabs.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Add active class to selected tab and content
        const selectedTab = document.querySelector(`.email-marketing-tabs .tab[data-tab="${tabName}"]`);
        const selectedContent = document.getElementById(`${tabName}-tab`);
        
        if (selectedTab && selectedContent) {
            selectedTab.classList.add('active');
            selectedContent.classList.add('active');
        }
    },
    
    // Setup the elements library panel
    setupElementsLibrary() {
        try {
            // Create panel if it doesn't exist
            if (!document.querySelector('.builder-panel')) {
                const panel = document.createElement('div');
                panel.className = 'builder-panel';
                document.querySelector('.email-builder').appendChild(panel);
                
                // Add styles for vertical icon menu and properties panel
                if (!document.getElementById('email-builder-styles')) {
                    const style = document.createElement('style');
                    style.id = 'email-builder-styles';
                    style.textContent = `
                        /* Main panel styles - vertical sidebar */
                        .builder-panel { 
                            position: fixed; 
                            left: 0; 
                            top: 0; 
                            bottom: 0; 
                            width: 60px; 
                            background-color: #fff; 
                            border-right: 1px solid #e3e6f0; 
                            overflow-y: auto; 
                            z-index: 900; 
                        }
                        
                        /* Element category styles */
                        .elements-category { 
                            padding: 10px 0; 
                            border-bottom: 1px solid #e3e6f0; 
                        }
                        .elements-category:last-child { 
                            border-bottom: none; 
                        }
                        .elements-category h4 { 
                            margin: 0; 
                            padding: 5px; 
                            font-size: 11px; 
                            text-transform: uppercase; 
                            color: #b7b9cc; 
                            text-align: center; 
                        }
                        
                        /* Element grid for vertical layout */
                        .element-grid { 
                            display: flex; 
                            flex-direction: column; 
                        }
                        .element-item { 
                            padding: 10px 0; 
                            text-align: center; 
                            cursor: move; 
                            position: relative; 
                            border: none; 
                        }
                        .element-item:hover { 
                            background-color: #f8f9fc; 
                        }
                        .element-item span { 
                            display: none; 
                        }
                        .element-icon { 
                            font-size: 18px; 
                            color: #4e73df; 
                        }
                        
                        /* Tooltip styles */
                        .element-tooltip { 
                            display: none; 
                            position: absolute; 
                            top: 50%; 
                            left: 100%; 
                            transform: translateY(-50%); 
                            background-color: #fff; 
                            border: 1px solid #ddd; 
                            border-radius: 4px; 
                            padding: 8px; 
                            width: 200px; 
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1); 
                            z-index: 950; 
                        }
                        .element-item:hover .element-tooltip { 
                            display: block; 
                        }
                        .element-tooltip h5 { 
                            margin: 0 0 5px 0; 
                            font-size: 14px; 
                        }
                        .element-tooltip p { 
                            margin: 0; 
                            font-size: 12px; 
                            color: #666; 
                        }
                        
                        /* Block action styles - positioned at top left */
                        .email-content-block { 
                            position: relative; 
                            border: 1px solid transparent; 
                            margin-bottom: 15px; 
                            padding: 10px; 
                        }
                        .email-content-block:hover { 
                            border-color: #e3e6f0; 
                        }
                        .email-content-block.active { 
                            border-color: #4e73df; 
                        }
                        .block-actions { 
                            position: absolute; 
                            top: 5px; 
                            left: 5px; 
                            display: flex; 
                            flex-direction: row; 
                            opacity: 0.2; 
                            transition: opacity 0.2s; 
                            z-index: 10; 
                            background-color: rgba(255,255,255,0.9); 
                            border-radius: 4px; 
                            padding: 2px; 
                        }
                        .email-content-block:hover .block-actions { 
                            opacity: 1; 
                        }
                        .block-action { 
                            margin-right: 3px; 
                            width: 24px; 
                            height: 24px; 
                            padding: 0; 
                            background: #fff; 
                            border: 1px solid #ddd; 
                            border-radius: 3px; 
                            cursor: pointer; 
                        }
                        .block-action:hover { 
                            background: #f0f0f0; 
                        }
                        .block-action i { 
                            font-size: 12px; 
                            line-height: 24px; 
                        }
                        
                        /* Properties panel styles */
                        .properties-panel { 
                            position: fixed; 
                            right: 0; 
                            top: 0; 
                            bottom: 0; 
                            width: 280px; 
                            background-color: #fff; 
                            border-left: 1px solid #e3e6f0; 
                            overflow-y: auto; 
                            z-index: 900; 
                            padding: 15px; 
                        }
                        .properties-panel h3 { 
                            margin: 0 0 15px 0; 
                            font-size: 18px; 
                            padding-bottom: 10px; 
                            border-bottom: 1px solid #e3e6f0; 
                        }
                        .properties-section { 
                            margin-bottom: 15px; 
                        }
                        .properties-section h4 { 
                            margin: 0 0 8px 0; 
                            font-size: 14px; 
                            color: #4e73df; 
                        }
                        .properties-control { 
                            margin-bottom: 10px; 
                        }
                        .properties-control label { 
                            display: block; 
                            margin-bottom: 5px; 
                            font-size: 12px; 
                            color: #5a5c69; 
                        }
                        .properties-control select, 
                        .properties-control input { 
                            width: 100%; 
                            padding: 5px; 
                            border: 1px solid #e3e6f0; 
                            border-radius: 4px; 
                        }
                        .color-palette { 
                            display: flex; 
                            flex-wrap: wrap; 
                            gap: 5px; 
                        }
                        .color-option { 
                            width: 24px; 
                            height: 24px; 
                            border-radius: 4px; 
                            cursor: pointer; 
                            border: 1px solid #ddd; 
                        }
                        .color-option.active { 
                            box-shadow: 0 0 0 2px #4e73df; 
                        }
                        
                        /* Adjust email canvas */
                        #email-canvas { 
                            margin-left: 70px; 
                            margin-right: 290px; 
                        }
                    `;
                    document.head.appendChild(style);
                }
                
                // Create element categories and items
                this._createElementsMenu(panel);
                
                // Create properties panel
                this._createPropertiesPanel();
            }
        } catch (error) {
            console.error('Error setting up elements library:', error);
        }
    },
    
    // Create the elements menu with categories
    _createElementsMenu(panel) {
        try {
            // Clear existing content
            panel.innerHTML = '';
            
            // Create categories
            const categories = [
                {
                    id: 'visual',
                    name: 'Visual',
                    elements: [
                        { type: 'text', icon: 'fa-font', name: 'Text', description: 'Add a text block to your email' },
                        { type: 'image', icon: 'fa-image', name: 'Image', description: 'Insert an image into your email' },
                        { type: 'button', icon: 'fa-mouse-pointer', name: 'Button', description: 'Add a call-to-action button' }
                    ]
                },
                {
                    id: 'structural',
                    name: 'Structure',
                    elements: [
                        { type: 'divider', icon: 'fa-minus', name: 'Divider', description: 'Add a horizontal line to separate content' },
                        { type: 'spacer', icon: 'fa-arrows-alt-v', name: 'Spacer', description: 'Add vertical spacing between elements' }
                    ]
                },
                {
                    id: 'interactive',
                    name: 'Interactive',
                    elements: [
                        { type: 'video', icon: 'fa-video', name: 'Video', description: 'Add a video to your email' },
                        { type: 'social', icon: 'fa-share-alt', name: 'Social', description: 'Add social media links' }
                    ]
                },
                {
                    id: 'dynamic',
                    name: 'Dynamic',
                    elements: [
                        { type: 'product', icon: 'fa-tag', name: 'Product', description: 'Add a product with details and image' },
                        { type: 'hero', icon: 'fa-image', name: 'Hero Banner', description: 'Add a full-width hero banner' }
                    ]
                }
            ];
            
            // Create elements for each category
            categories.forEach(category => {
                const categoryDiv = document.createElement('div');
                categoryDiv.className = 'elements-category';
                categoryDiv.setAttribute('data-category', category.id);
                
                // Add category header
                const header = document.createElement('h4');
                header.textContent = category.name;
                categoryDiv.appendChild(header);
                
                // Add elements grid
                const grid = document.createElement('div');
                grid.className = 'element-grid';
                
                // Add individual elements
                category.elements.forEach(element => {
                    const item = document.createElement('div');
                    item.className = 'element-item';
                    item.setAttribute('draggable', 'true');
                    item.setAttribute('data-element-type', element.type);
                    
                    // Add icon
                    const icon = document.createElement('i');
                    icon.className = `element-icon fas ${element.icon}`;
                    item.appendChild(icon);
                    
                    // Add tooltip
                    const tooltip = document.createElement('div');
                    tooltip.className = 'element-tooltip';
                    
                    const tooltipTitle = document.createElement('h5');
                    tooltipTitle.textContent = element.name;
                    tooltip.appendChild(tooltipTitle);
                    
                    const tooltipDesc = document.createElement('p');
                    tooltipDesc.textContent = element.description;
                    tooltip.appendChild(tooltipDesc);
                    
                    item.appendChild(tooltip);
                    
                    // Add event listeners for drag operations
                    item.addEventListener('dragstart', this._handleDragStart.bind(this));
                    
                    // Add to grid
                    grid.appendChild(item);
                });
                
                categoryDiv.appendChild(grid);
                panel.appendChild(categoryDiv);
            });
        } catch (error) {
            console.error('Error creating elements menu:', error);
        }
    },
    
    // Create the properties panel
    _createPropertiesPanel() {
        try {
            // Check if properties panel already exists
            if (!document.querySelector('.properties-panel')) {
                const panel = document.createElement('div');
                panel.className = 'properties-panel';
                panel.innerHTML = `
                    <h3>Block Properties</h3>
                    <div class="properties-content">
                        <p class="no-block-message">Select a block to edit its properties</p>
                    </div>
                `;
                document.querySelector('.email-builder').appendChild(panel);
            }
            
            // Initialize default color palette
            this._colorPalette = {
                primary: '#4e73df',
                secondary: '#858796',
                success: '#1cc88a',
                info: '#36b9cc',
                warning: '#f6c23e',
                danger: '#e74a3b',
                light: '#f8f9fc',
                dark: '#5a5c69'
            };
        } catch (error) {
            console.error('Error creating properties panel:', error);
        }
    },
    
    // Add CSS styles to the document
    _addStyles() {
        try {
            // Create a style element if it doesn't already exist
            if (!document.getElementById('email-builder-styles')) {
                const style = document.createElement('style');
                style.id = 'email-builder-styles';
                style.type = 'text/css';
                style.innerHTML = `
                    .element-tooltip p { 
                        margin: 0; 
                        font-size: 12px; 
                        color: #666; 
                    }
                    
                    /* Block action styles - positioned at top left */
                    .email-content-block { 
                        position: relative; 
                        border: 1px solid transparent; 
                        margin-bottom: 15px; 
                    }
                    .email-content-block:hover { 
                        border-color: #e3e6f0; 
                    }
                    .email-content-block.active { 
                        border-color: #4e73df; 
                    }
                    .block-actions { 
                        position: absolute; 
                        top: 5px; 
                        left: 5px; 
                        display: flex; 
                        flex-direction: row; 
                        opacity: 0.2; 
                        transition: opacity 0.2s; 
                        z-index: 10; 
                        background-color: rgba(255,255,255,0.9); 
                        border-radius: 4px; 
                        padding: 2px; 
                    }
                    .email-content-block:hover .block-actions { 
                        opacity: 1; 
                    }
                    .block-action { 
                        margin-right: 3px; 
                        width: 24px; 
                        height: 24px; 
                        padding: 0; 
                        background: #fff; 
                        border: 1px solid #ddd; 
                        border-radius: 3px; 
                        cursor: pointer; 
                    }
                    .block-action:hover { 
                        background: #f0f0f0; 
                    }
                    .block-action i { 
                        font-size: 12px; 
                        line-height: 24px; 
                    }
                    
                    /* Adjust email canvas */
                    #email-canvas { 
                        margin-left: 70px; 
                    }
                `;
                document.head.appendChild(style);
            }
        } catch (error) {
            console.error('Error adding styles:', error);
        }
    },
    
    // Initialize the elements library and related components
    setupElementsLibrary() {
        try {
            // Check if the builder panel already exists
            if (!document.querySelector('.builder-panel')) {
                const panel = document.createElement('div');
                panel.className = 'builder-panel';
                document.querySelector('.email-builder').appendChild(panel);
                
                // Add styles to the document
                this._addStyles();
                
                // Create the elements menu with categories
                this._createElementsMenu(panel);
                
                // Create elements categories based on the reference images
                this.createItemsCategory();
                this.createLogosCategory();
                this.createTitlesCategory();
                
                // Set up proper canvas and drop zones
                this.enhanceEmailCanvas();
                
                console.log('Elements library set up successfully');
            }
        } catch (error) {
            console.error('Error setting up elements library:', error);
        }
    },
    
    // Setup drag and drop functionality
    setupDragAndDropFunctionality() {
        try {
            // Set up draggable elements
            const elementItems = document.querySelectorAll('.element-item[draggable="true"]');
            elementItems.forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    this.handleDragStart(e, item);
                });
                
                item.addEventListener('dragend', (e) => {
                    this.handleDragEnd(e);
                });
                
                // Add click handler for better mobile support
                item.addEventListener('click', (e) => {
                    if (window.innerWidth <= 768) {
                        // Mobile/touch device handling
                        const elementType = item.getAttribute('data-element');
                        const dropzone = document.querySelector('.email-dropzone:last-child');
                        if (elementType && dropzone) {
                            this.createElementInDropzone(elementType, dropzone);
                        }
                    }
                });
            });
            
            // Set up drop zones
            const dropzones = document.querySelectorAll('.email-dropzone');
            dropzones.forEach(zone => {
                zone.addEventListener('dragover', (e) => {
                    this.handleDragOver(e, zone);
                });
                
                zone.addEventListener('dragleave', () => {
                    this.handleDragLeave(zone);
                });
                
                zone.addEventListener('drop', (e) => {
                    this.handleDrop(e, zone);
                });
            });
            
            // Set up proper canvas and drop zones if not already set up
            const emailCanvas = document.getElementById('email-canvas');
            if (emailCanvas && !emailCanvas.hasAttribute('data-initialized')) {
                this.enhanceEmailCanvas();
                emailCanvas.setAttribute('data-initialized', 'true');
            }
            
            // Set up the event listeners for content blocks
            const contentBlocks = document.querySelectorAll('.email-content-block');
            contentBlocks.forEach(block => {
                this.setupContentBlockEvents(block);
            });
            
            console.log('Drag and drop functionality set up successfully');

            console.log('Enhanced drag and drop functionality set up successfully');
        } catch (error) {
            console.error('Error setting up drag and drop functionality:', error);
        }
    },

    // Create basic elements category (Items)
    createItemsCategory() {
        try {
            const panel = document.querySelector('.builder-panel');
            if (!panel) return;

            if (!panel.querySelector('[data-category="items"]')) {
                const itemsCategory = document.createElement('div');
                itemsCategory.className = 'elements-category';
                itemsCategory.setAttribute('data-category', 'items');
                
                itemsCategory.innerHTML = `
                    <h4>Items</h4>
                    <div class="element-grid">
                        <div class="element-item" draggable="true" data-element-type="text">
                            <div class="element-icon">T</div>
                            <span>Text</span>
                            <div class="element-tooltip">
                                <h5>Text Block</h5>
                                <p>Add a paragraph of text content to your email.</p>
                            </div>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="button">
                            <div class="element-icon"><i class="fas fa-square"></i></div>
                            <span>Button</span>
                            <div class="element-tooltip">
                                <h5>Button</h5>
                                <p>Add a clickable button with custom text and URL.</p>
                            </div>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="image">
                            <div class="element-icon"><i class="fas fa-image"></i></div>
                            <span>Image</span>
                            <div class="element-tooltip">
                                <h5>Image</h5>
                                <p>Add an image that can be linked to a URL.</p>
                            </div>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="video">
                            <div class="element-icon"><i class="fas fa-video"></i></div>
                            <span>Video</span>
                            <div class="element-tooltip">
                                <h5>Video Thumbnail</h5>
                                <p>Add a video thumbnail that links to a video.</p>
                            </div>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="product">
                            <div class="element-icon"><i class="fas fa-tag"></i></div>
                            <span>Product</span>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="menu">
                            <div class="element-icon"><i class="fas fa-bars"></i></div>
                            <span>Menu</span>
                        </div>
                    </div>
                `;

                panel.appendChild(itemsCategory);
                
                // Setup drag functionality for the newly created items
                const elementItems = itemsCategory.querySelectorAll('.element-item[draggable="true"]');
                elementItems.forEach(item => {
                    item.addEventListener('dragstart', (e) => {
                        this.handleDragStart(e, item);
                    });
                });
            }
        } catch (error) {
            console.error('Error creating items category:', error);
        }
    },

    // Create logos category
    createLogosCategory() {
        try {
            const panel = document.querySelector('.builder-panel');
            if (!panel) return;

            if (!panel.querySelector('[data-category="logos"]')) {
                const logosCategory = document.createElement('div');
                logosCategory.className = 'elements-category';
                logosCategory.setAttribute('data-category', 'logos');
                logosCategory.innerHTML = `
                    <h4>Logo</h4>
                    <div class="element-grid">
                        <div class="element-item" draggable="true" data-element-type="logo">
                            <div class="element-preview basic-logo">LOGO</div>
                            <span>Basic Logo</span>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="logo-menu">
                            <div class="element-preview logo-menu">
                                <div class="logo-preview">LOGO</div>
                                <div class="menu-preview">
                                    <div class="menu-item"></div>
                                    <div class="menu-item"></div>
                                    <div class="menu-item"></div>
                                </div>
                            </div>
                            <span>Logo & Menu</span>
                        </div>
                    </div>
                `;

                panel.appendChild(logosCategory);
                
                // Setup drag functionality for the newly created logo items
                const logoItems = logosCategory.querySelectorAll('.element-item[draggable="true"]');
                logoItems.forEach(item => {
                    item.addEventListener('dragstart', (e) => {
                        this.handleDragStart(e, item);
                    });
                });
            }
        } catch (error) {
            console.error('Error creating logos category:', error);
        }
    },

    // Create titles category
    createTitlesCategory() {
        try {
            const panel = document.querySelector('.builder-panel');
            if (!panel) return;

            if (!panel.querySelector('[data-category="titles"]')) {
                const titlesCategory = document.createElement('div');
                titlesCategory.className = 'elements-category';
                titlesCategory.setAttribute('data-category', 'titles');
                titlesCategory.innerHTML = `
                    <h4>Title</h4>
                    <div class="element-grid">
                        <div class="element-item" draggable="true" data-element-type="title-1">
                            <div class="element-preview title-preview">
                                <div class="title-text">A phone case for every taste</div>
                                <div class="title-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
                            </div>
                            <span>Title 1</span>
                        </div>

                        <div class="element-item" draggable="true" data-element-type="title-2">
                            <div class="element-preview title-preview">
                                <div class="title-text">Don't miss out on savings</div>
                            </div>
                            <span>Title 2</span>
                        </div>
                    </div>
                `;

                panel.appendChild(titlesCategory);
                
                // Setup drag functionality for the newly created title items
                const titleItems = titlesCategory.querySelectorAll('.element-item[draggable="true"]');
                titleItems.forEach(item => {
                    item.addEventListener('dragstart', (e) => {
                        this.handleDragStart(e, item);
                    });
                });
            }
        } catch (error) {
            console.error('Error creating titles category:', error);
        }
    },

    // Enhance the email canvas
    enhanceEmailCanvas() {
        const canvas = document.getElementById('email-canvas');
        if (!canvas) {
            console.error('Email canvas not found');
            return;
        }

        // Make sure canvas is droppable
        canvas.addEventListener('dragover', e => this.handleDragOver(e, canvas));
        canvas.addEventListener('dragleave', () => this.handleDragLeave(canvas));
        canvas.addEventListener('drop', e => this.handleDrop(e, canvas));

        // Clear any existing content and add welcome message if empty
        if (canvas.children.length === 0) {
            const welcomeMessage = document.createElement('div');
            welcomeMessage.className = 'canvas-message';
            welcomeMessage.innerHTML = `
                <i class="fas fa-arrow-left"></i>
                <h3>Start by dragging elements from the sidebar</h3>
                <p>Or choose a template below</p>
            `;
            canvas.appendChild(welcomeMessage);
        }
    },

    // Set up the email canvas for drag and drop operations
    setupEmailCanvas() {
        const canvas = document.querySelector('.email-canvas');
        const dropzones = document.querySelectorAll('.email-dropzone');

        if (canvas) {
            // Set up the dropzones
            dropzones.forEach(zone => {
                zone.addEventListener('dragover', e => this.handleDragOver(e, zone));
                zone.addEventListener('dragleave', e => this.handleDragLeave(zone));
                zone.addEventListener('drop', e => this.handleDrop(e, zone));
            });

            // Setup existing content blocks
            const contentBlocks = document.querySelectorAll('.email-content-block');
            contentBlocks.forEach(block => {
                this.setupContentBlockEvents(block);
            });
        }
    },

    // Set up events for a content block
    setupContentBlockEvents(block) {
        // Action buttons
        const actionButtons = block.querySelectorAll('.block-action');

        actionButtons.forEach(button => {
            const action = button.getAttribute('title').toLowerCase();

            button.addEventListener('click', () => {
                switch (action) {
                    case 'move up':
                        this.moveBlockUp(block);
                        break;
                    case 'move down':
                        this.moveBlockDown(block);
                        break;
                    case 'edit':
                        this.editBlock(block);
                        break;
                    case 'delete':
                        this.deleteBlock(block);
                        break;
                }
            });
        });

        // Make the block selectable for editing
        block.addEventListener('click', () => {
            this.selectBlock(block);
        });
    },

    // Set up the settings panels
    setupSettingsPanels() {
        const settingsTabs = document.querySelectorAll('.settings-tab');
        const settingsPanels = document.querySelectorAll('.settings-panel');

        settingsTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.getAttribute('data-settings-tab');

                // Remove active class from all tabs and panels
                settingsTabs.forEach(t => t.classList.remove('active'));
                settingsPanels.forEach(p => p.classList.remove('active'));

                // Add active class to selected tab and container
                tab.classList.add('active');
                const elementsContainer = document.getElementById(`${tabName}-elements`);
                if (elementsContainer) {
                    elementsContainer.classList.add('active');
                }
            });
        });
    },

    // Set up the preview controls
    setupPreviewControls() {
        const previewDevices = document.querySelectorAll('.preview-device');
        const emailDocument = document.querySelector('.email-document');

        previewDevices.forEach(device => {
            device.addEventListener('click', () => {
                const deviceType = device.getAttribute('data-device');

                // Remove active class from all preview devices
                previewDevices.forEach(d => d.classList.remove('active'));

                // Add active class to selected device
                device.classList.add('active');

                // Apply preview mode
                if (emailDocument) {
                    // Remove any existing device classes
                    emailDocument.classList.remove('preview-desktop', 'preview-tablet', 'preview-mobile');

                    // Add the appropriate device class
                    emailDocument.classList.add(`preview-${deviceType}`);

                    // Adjust width based on device type
                    switch (deviceType) {
                        case 'mobile':
                            emailDocument.style.width = '320px';
                            break;
                        case 'tablet':
                            emailDocument.style.width = '480px';
                            break;
                        case 'desktop':
                        default:
                            emailDocument.style.width = '600px';
                            break;
                    }
                }
            });
        });
    },

    // Set up action buttons (save, preview, etc.)
    setupActionButtons() {
        const saveTemplateBtn = document.querySelector('.email-studio-actions .btn-secondary');
        const previewTestBtn = document.querySelector('.email-studio-actions .btn-primary');
        const saveContinueBtn = document.querySelector('.email-studio-actions .btn-success');

        if (saveTemplateBtn) {
            saveTemplateBtn.addEventListener('click', () => this.saveTemplate());
        }

        if (previewTestBtn) {
            previewTestBtn.addEventListener('click', () => this.previewEmail());
        }

        if (saveContinueBtn) {
            saveContinueBtn.addEventListener('click', () => this.saveAndContinue());
        }
    },

    // Handle drag start event
    handleDragStart(e, item) {
        this.dragData.source = item;
        this.dragData.elementType = item.getAttribute('data-element-type');
        this.dragData.isDragging = true;

        // Set dragging class
        item.classList.add('dragging');

        // Set drag ghost image (optional)
        if (e.dataTransfer) {
            e.dataTransfer.setData('text/plain', this.dragData.elementType);
            e.dataTransfer.effectAllowed = 'copy';
        }
    },

    // Handle drag over event
    handleDragOver(e, zone) {
        e.preventDefault();
        if (this.dragData.isDragging) {
            zone.classList.add('drag-hover');
        }
        return false;
    },

    // Handle drag leave event
    handleDragLeave(zone) {
        zone.classList.remove('drag-hover');
    },

    // Handle drop event
    handleDrop(e, zone) {
        e.preventDefault();
        zone.classList.remove('drag-hover');

        if (this.dragData.isDragging && this.dragData.elementType) {
            this.createElementInDropzone(this.dragData.elementType, zone);
        }

        this.dragData.isDragging = false;
        return false;
    },

    // Handle drag end event
    handleDragEnd(e) {
        if (this.dragData.source) {
            this.dragData.source.classList.remove('dragging');
        }

        // Reset drag data
        this.dragData.isDragging = false;
        this.dragData.source = null;
        this.dragData.elementType = null;
    },

    // Create a new element in the dropzone
    createElementInDropzone(elementType, dropzone) {
        try {
            if (!elementType || !dropzone) {
                console.error('Missing element type or dropzone');
                return;
            }

            // Create a new content block
            const contentBlock = document.createElement('div');
            contentBlock.className = 'email-content-block';
            contentBlock.setAttribute('data-block-type', elementType);

            // Check if the block already has a toolbar
            const hasToolbar = contentBlock.querySelector('.block-toolbar');
            
            // Add content based on element type
            switch (elementType) {
                case 'text':
                    // Get color from the palette for text
                    const textColor = this._getColor('dark');
                    
                    contentBlock.innerHTML = `
                        <div style="padding: 20px;">
                            <p data-palette-color="dark" style="margin: 0; color: ${textColor}; font-size: 16px;">Double click to edit this text. This is a sample paragraph that demonstrates what your content could look like.</p>
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
                    break;
                case 'button':
                    // Get colors from the palette system
                    const buttonBgColor = this._getColor('primary');
                    const buttonTextColor = this._getColor('light');
                    
                    contentBlock.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <a href="#" data-palette-color="primary" style="display: inline-block; padding: 10px 20px; background-color: ${buttonBgColor}; color: ${buttonTextColor}; text-decoration: none; border-radius: 5px;">Click Here</a>
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
                    break;
                case 'image':
                    contentBlock.innerHTML = `
                        <div style="padding: 20px; text-align: center;">
                            <img src="https://via.placeholder.com/600x300" alt="Placeholder Image" style="max-width: 100%; height: auto;">
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
                    break;
                case 'hero':
                    contentBlock.innerHTML = `
                        <div style="background-color: #f8f9fc; padding: 40px 20px; text-align: center;">
                            <h1 style="color: #4e73df; margin-bottom: 20px;">Welcome to Our Newsletter</h1>
                            <p style="color: #5a5c69; margin-bottom: 20px;">Stay updated with our latest news and promotions</p>
                            <a href="#" style="display: inline-block; padding: 10px 20px; background-color: #4e73df; color: white; text-decoration: none; border-radius: 5px;">Learn More</a>
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
                    break;
                case 'product':
                    contentBlock.innerHTML = `
                        <div style="padding: 20px;">
                            <h2 style="color: #333; text-align: center; margin-bottom: 20px;">Featured Products</h2>
                            <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap;">
                                <div style="flex: 0 0 calc(50% - 10px); max-width: calc(50% - 10px); box-sizing: border-box;">
                                    <img src="https://via.placeholder.com/300x200" alt="Product 1" style="width: 100%; height: auto;">
                                    <h3 style="margin: 10px 0 5px;">Product Name</h3>
                                    <p style="margin: 0 0 10px; color: #666;">$99.99</p>
                                    <a href="#" style="display: inline-block; padding: 5px 10px; background-color: #4e73df; color: white; text-decoration: none; border-radius: 3px; font-size: 14px;">Buy Now</a>
                                </div>
                                <div style="flex: 0 0 calc(50% - 10px); max-width: calc(50% - 10px); box-sizing: border-box;">
                                    <img src="https://via.placeholder.com/300x200" alt="Product 2" style="width: 100%; height: auto;">
                                    <h3 style="margin: 10px 0 5px;">Product Name</h3>
                                    <p style="margin: 0 0 10px; color: #666;">$79.99</p>
                                    <a href="#" style="display: inline-block; padding: 5px 10px; background-color: #4e73df; color: white; text-decoration: none; border-radius: 3px; font-size: 14px;">Buy Now</a>
                                </div>
                            </div>
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
                    break;
                default:
                    // Get colors from the palette
                    const borderColor = this._getColor('muted');
                    const placeholderTextColor = this._getColor('muted');
                    
                    contentBlock.innerHTML = `
                        <div style="padding: 20px; border: 1px dashed ${borderColor}; text-align: center;">
                            <p data-palette-color="muted" style="margin: 0; color: ${placeholderTextColor};">${elementType} element placeholder</p>
                        </div>
                        <div class="block-actions" style="display: none;">
                            <button class="block-action" title="Move Up"><i class="material-icons">arrow_upward</i></button>
                            <button class="block-action" title="Move Down"><i class="material-icons">arrow_downward</i></button>
                            <button class="block-action" title="Color"><i class="material-icons">palette</i></button>
                            <button class="block-action" title="Delete"><i class="material-icons">delete</i></button>
                        </div>
                    `;
            }

            // Replace the dropzone with the new element and a new dropzone
            const parentElement = dropzone.parentElement;
            const newDropzone = document.createElement('div');
            newDropzone.className = 'email-dropzone';
            newDropzone.innerHTML = '<p><i class="fas fa-plus-circle"></i> Drag elements here</p>';

            // Add the content block before the dropzone
            parentElement.insertBefore(contentBlock, dropzone);

            // Setup events for the new content block
            this.setupContentBlockEvents(contentBlock);

            // Add event listeners to the new dropzone
            newDropzone.addEventListener('dragover', e => this.handleDragOver(e, newDropzone));
            newDropzone.addEventListener('dragleave', () => this.handleDragLeave(newDropzone));
            newDropzone.addEventListener('drop', e => this.handleDrop(e, newDropzone));
            
            // Select the new block for editing
            this.selectBlock(contentBlock);
        } catch (error) {
            console.error('Error creating element in dropzone:', error);
        }
    },

    // Move a block down
    moveBlockDown(block) {
        const parent = block.parentNode;
        const next = block.nextElementSibling;
        if (next) {
            parent.insertBefore(next, block);
        }
    },

    // Edit a block
    editBlock(block) {
        this.selectBlock(block);
    },

    // Delete a block
    deleteBlock(block) {
        if (block && block.parentNode) {
            block.parentNode.removeChild(block);
            this.activeElement = null;
        }
    },

    // Select a block for editing
    selectBlock(block) {
        if (!block) return;

        // Remove active class from any currently active element
        document.querySelectorAll('.email-block.active').forEach(el => {
            el.classList.remove('active');
        });

        // Set as active
        block.classList.add('active');
        this.activeElement = block;
        this.updateSettingsPanel(block);
    },

    // Update the settings panel based on selected block
    updateSettingsPanel(block) {
        if (!block) return;

        const type = block.getAttribute('data-block-type');
        const settingsPanel = document.getElementById('block-settings-panel');

        if (settingsPanel) {
            // Clear any existing settings
            settingsPanel.innerHTML = '';

            // Create type-specific settings UI
            const settingsTitle = document.createElement('h4');
            settingsTitle.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Settings`;
            settingsPanel.appendChild(settingsTitle);

            // Add relevant settings based on block type
            this.createBlockSettings(type, block, settingsPanel);
        }
    },

    // Apply formatting from toolbar
    applyFormatting(format) {
        if (!this.activeElement) return;

        const content = this.activeElement.querySelector('.block-content');
        if (!content) return;

        switch (format) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'link':
                const url = prompt('Enter the link URL:', 'https://');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'align-left':
                content.style.textAlign = 'left';
                break;
            case 'align-center':
                content.style.textAlign = 'center';
                break;
            case 'align-right':
                content.style.textAlign = 'right';
                break;
        }
    },

    // Apply color setting
    applyColorSetting(settingId, color) {
        if (!this.activeElement) return;

        const content = this.activeElement.querySelector('.block-content');
        if (!content) return;

        switch (settingId) {
            case 'text-color':
                content.style.color = color;
                break;
            case 'background-color':
                content.style.backgroundColor = color;
                break;
            case 'button-color':
                const button = this.activeElement.querySelector('.btn');
                if (button) {
                    button.style.backgroundColor = color;
                }
                break;
        }
    },

    // Save the email template
    saveTemplate() {
        try {
            const emailCanvas = document.getElementById('email-canvas');
            if (!emailCanvas) {
                throw new Error('Email canvas not found');
            }

            // Get the email template HTML
            const emailHTML = emailCanvas.innerHTML;

            // Get current email name or prompt for a new one
            let templateName = document.querySelector('#email-template-name').value;
            if (!templateName) {
                templateName = prompt('Enter a name for this email template:');
                if (templateName) {
                    document.querySelector('#email-template-name').value = templateName;
                } else {
                    return; // User cancelled
                }
            }

            // Save to localStorage (in a real app, this would be saved to the server)
            localStorage.setItem(`email_template_${templateName.replace(/\s+/g, '_')}`, emailHTML);
            alert(`Template "${templateName}" saved successfully!`);
        } catch (error) {
            console.error('Error saving template:', error);
            alert('Failed to save template. See console for details.');
        }
    },

    // Preview the email in a new window
    previewEmail() {
        try {
            const emailCanvas = document.getElementById('email-canvas');
            if (!emailCanvas) {
                throw new Error('Email canvas not found');
            }

            // Get the email template HTML
            const emailHTML = emailCanvas.innerHTML;

            // Create a new window with basic HTML structure and content
            const previewWindow = window.open('', '_blank');
            if (!previewWindow) {
                alert('Pop-up blocker may be preventing the preview. Please allow pop-ups for this site.');
                return;
            }

            // Create a basic email template structure with some default styling
            const previewHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Preview</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            margin: 0;
                            padding: 0;
                        }
                        .preview-container {
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }
                        .email-content {
                            background-color: #ffffff;
                            padding: 20px;
                            border-radius: 5px;
                            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                        }
                        .preview-header {
                            background-color: #333;
                            color: #fff;
                            padding: 10px 20px;
                            text-align: center;
                            font-size: 14px;
                        }
                        .preview-header a {
                            color: #fff;
                            text-decoration: underline;
                        }
                        .preview-header p {
                            margin: 5px 0;
                        }
                        .preview-footer {
                            margin-top: 20px;
                            font-size: 12px;
                            text-align: center;
                            color: #666;
                        }
                        @media only screen and (max-width: 480px) {
                            .preview-container {
                                width: 100% !important;
                                padding: 10px !important;
                            }
                            .email-content {
                                padding: 10px !important;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="preview-header">
                        <p>This is a preview of your email. <a href="#" onclick="window.print(); return false;">Print</a> | <a href="#" onclick="window.close(); return false;">Close</a></p>
                    </div>
                    <div class="preview-container">
                        <div class="email-content">
                            ${emailHTML}
                        </div>
                        <div class="preview-footer">
                            <p>This is an email preview. You may review and close this window when finished.</p>
                            <p>&copy; ${new Date().getFullYear()} Fooodis Blog. All rights reserved.</p>
                            <p><a href="#unsubscribe">Unsubscribe</a> | <a href="#preferences">Email Preferences</a></p>
                        </div>
                    </div>
                </body>
                </html>
            `;

            previewWindow.document.open();
            previewWindow.document.write(previewHTML);
            previewWindow.document.close();

        } catch (error) {
            console.error('Error previewing email:', error);
            alert('Failed to preview template. See console for details.');
        }
    },
    
    // Color Management Methods (internal, doesn't change UI)
    
    // Get a color from the palette
    _getColor(colorName) {
        try {
            // Return from palette if exists
            if (this._colorPalette[colorName]) {
                return this._colorPalette[colorName];
            }
            
            // Return the input if it's already a color value
            if (colorName && (colorName.startsWith('#') || colorName.startsWith('rgb'))) {
                return colorName;
            }
            
            return null; // Return null if not found
        } catch (error) {
            console.error('Error getting color:', error);
            return null;
        }
    },
    
    // Set a color in the palette (doesn't update UI automatically)
    _setColor(colorName, colorValue) {
        try {
            if (!colorName || !colorValue) return false;
            
            // Validate color format (basic validation)
            const isValidHex = /^#([0-9A-F]{3}){1,2}$/i.test(colorValue);
            const isValidRgba = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d\.]+)?\s*\)$/i.test(colorValue);
            
            if (!isValidHex && !isValidRgba) {
                console.error('Invalid color format');
                return false;
            }
            
            // Update the palette
            this._colorPalette[colorName] = colorValue;
            
            // Save the settings to localStorage
            this._savePaletteSettings();
            
            return true;
        } catch (error) {
            console.error('Error setting color:', error);
            return false;
        }
    },
    
    // Convert HEX to RGBA (utility method)
    _hexToRgba(hex, alpha = 1) {
        try {
            if (!hex) return null;
            
            // Remove the hash if it exists
            hex = hex.replace('#', '');
            
            // Parse the hex values
            let r, g, b;
            if (hex.length === 3) {
                r = parseInt(hex.substring(0, 1).repeat(2), 16);
                g = parseInt(hex.substring(1, 2).repeat(2), 16);
                b = parseInt(hex.substring(2, 3).repeat(2), 16);
            } else {
                r = parseInt(hex.substring(0, 2), 16);
                g = parseInt(hex.substring(2, 4), 16);
                b = parseInt(hex.substring(4, 6), 16);
            }
            
            // Return the rgba value
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        } catch (error) {
            console.error('Error converting hex to rgba:', error);
            return null;
        }
    },
    
    // Save palette settings to localStorage
    _savePaletteSettings() {
        try {
            localStorage.setItem('email_builder_palette', JSON.stringify(this._colorPalette));
        } catch (error) {
            console.error('Error saving palette settings:', error);
        }
    },
    
    // Load palette settings from localStorage
    _loadPaletteSettings() {
        try {
            const savedPalette = localStorage.getItem('email_builder_palette');
            if (savedPalette) {
                const parsed = JSON.parse(savedPalette);
                // Only update the palette if it's a valid object
                if (parsed && typeof parsed === 'object') {
                    this._colorPalette = {...this._colorPalette, ...parsed};
                }
            }
        } catch (error) {
            console.error('Error loading palette settings:', error);
        }
    },
    
    // Apply a color from the palette to an element
    _applyColorToElement(element, colorName, property = 'color') {
        if (!element || !colorName || !property) return;
        
        const color = this._getColor(colorName);
        if (color) {
            element.style[property] = color;
        }
    },

    // Save the template and continue to the next step (sending)
    saveAndContinue() {
        try {
            // First save the template
            this.saveTemplate();
            
            // Navigate to the campaigns tab
            const campaignsTab = document.querySelector('.email-marketing-tabs .tab[data-tab="campaigns"]');
            if (campaignsTab) {
                campaignsTab.click();
            }
    
            // Optionally show a modal to configure sending options
            alert('Template saved! You can now set up your campaign details.');
        } catch (error) {
            console.error('Error saving and continuing:', error);
            alert('Failed to proceed to the next step. See console for details.');
        }
    }
};

// Initialize the Email Builder when the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the email marketing page
    const emailCanvas = document.getElementById('email-canvas');
    if (emailCanvas) {
        EmailBuilder.init();
    }
});
