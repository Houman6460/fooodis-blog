/**
 * Email Interface Refinements
 * - Narrow vertical icon-only panel with tooltips
 * - Repositioned drag handles
 * - Dynamic right-side property panel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize interface refinements once DOM is loaded
    initEmailInterfaceRefinements();
});

/**
 * Initialize all email interface refinements
 */
function initEmailInterfaceRefinements() {
    // Only initialize if email builder section is present
    const emailMarketingSection = document.getElementById('email-marketing-section');
    if (!emailMarketingSection) return;
    
    console.log('Initializing email interface refinements...');
    
    // Task 1.1: Convert elements sidebar to icon-only mode with tooltips
    setupIconOnlyPanel();
    
    // Task 1.2: Add drag handles to all content blocks
    setupDragHandles();
    
    // Task 1.3: Create and setup the properties panel
    setupPropertiesPanel();
    
    // Add event delegation for future elements
    addEventDelegation();
    
    console.log('Email interface refinements initialized successfully');
}

/**
 * Task 1.1: Setup icon-only sidebar panel with enhanced Material Design tooltips
 */
function setupIconOnlyPanel() {
    const elementsPanel = document.querySelector('.email-elements-sidebar');
    if (!elementsPanel) return;
    
    // Add the icon-only class to convert the panel
    elementsPanel.classList.add('icon-only-mode');
    
    // Get all element items and add enhanced tooltips
    const elementItems = elementsPanel.querySelectorAll('.element-item');
    elementItems.forEach(item => {
        const elementType = item.getAttribute('data-element-type');
        const elementName = item.querySelector('span')?.textContent || 'Element';
        
        // Get enhanced descriptions for the element
        const { title, description, usage } = getEnhancedElementDescription(elementType, elementName);
        
        // Format tooltip with title, description and usage hint
        let tooltipContent = `${title}\n\n${description}`;
        if (usage) {
            tooltipContent += `\n\n${usage}`;
        }
        
        // Set the tooltip content as a data attribute
        item.setAttribute('data-tooltip', tooltipContent);
        
        // Ensure accessibility by adding proper ARIA attributes
        item.setAttribute('aria-label', title);
        item.setAttribute('title', title); // Simple fallback tooltip
    });
}

/**
 * Get enhanced descriptions for element types including title, description and usage tips
 * @param {string} elementType - The type of element
 * @param {string} defaultName - Default element name to use if no specialized title is found
 * @return {Object} Object with title, description and usage properties
 */
function getEnhancedElementDescription(elementType, defaultName = 'Element') {
    // Default result structure
    const result = {
        title: defaultName,
        description: 'Drag to add to your email',
        usage: ''
    };
    
    // Map of enhanced descriptions
    const enhancedDescriptions = {
        // Structure elements
        'preheader': {
            title: 'Preheader Text',
            description: 'Preview text shown in email inbox views before opening.',
            usage: 'Use for important preview information that entices opening.'
        },
        'header': {
            title: 'Email Header',
            description: 'Top section containing logo, navigation, and branding.',
            usage: 'Creates a consistent brand presence at the top of your email.'
        },
        'hero': {
            title: 'Hero Banner',
            description: 'Large featured image or banner to highlight key message.',
            usage: 'Great for promotions, announcements, or featured products.'
        },
        'footer': {
            title: 'Email Footer',
            description: 'Bottom section with contact, legal, and unsubscribe info.',
            usage: 'Required for CAN-SPAM compliance and contact information.'
        },
        
        // Layout elements
        'single-column': {
            title: 'Single Column',
            description: 'Full-width content container for simple layouts.',
            usage: 'Best for mobile viewing and straightforward content.'
        },
        'two-column': {
            title: 'Two Columns',
            description: 'Side-by-side content containers in equal or variable widths.',
            usage: 'Useful for comparing items or creating visual variety.'
        },
        'three-column': {
            title: 'Three Columns',
            description: 'Three parallel content containers for compact layouts.',
            usage: 'Great for product listings, feature highlights, or team members.'
        },
        
        // Content elements
        'text': {
            title: 'Text Block',
            description: 'Formatted text content with rich styling options.',
            usage: 'Use for paragraphs, headings, and general content.'
        },
        'image': {
            title: 'Image',
            description: 'Responsive image with alt text and optional link.',
            usage: 'Optimize image size for faster loading (max 600px width).'
        },
        'button': {
            title: 'Call-to-Action Button',
            description: 'Clickable button that stands out from text links.',
            usage: 'Use contrasting colors and clear action text (5-7 words max).'
        },
        'video': {
            title: 'Video',
            description: 'Embedded video content or video thumbnail with play button.',
            usage: 'Links to external video sites with thumbnail preview image.'
        },
        'list': {
            title: 'Bullet List',
            description: 'Organized bullet points for scannable content.',
            usage: 'Great for features, benefits, or steps that don\'t need ordering.'
        },
        'numbered-list': {
            title: 'Numbered List',
            description: 'Sequential numbered items for ordered content.',
            usage: 'Perfect for step-by-step instructions or ranked items.'
        },
        'divider': {
            title: 'Divider Line',
            description: 'Horizontal separator between content sections.',
            usage: 'Creates visual breaks between different content topics.'
        },
        'spacer': {
            title: 'Vertical Spacer',
            description: 'Adds vertical space between elements.',
            usage: 'Improves readability by creating visual breathing room.'
        },
        'html': {
            title: 'HTML Code Block',
            description: 'Custom HTML code insertion for advanced elements.',
            usage: 'For developers to add custom features not available in the builder.'
        },
        
        // Interactive elements
        'survey': {
            title: 'Survey/Poll',
            description: 'Interactive question form for gathering feedback.',
            usage: 'Keep it short with clear questions and obvious response options.'
        },
        'timer': {
            title: 'Countdown Timer',
            description: 'Dynamic timer showing time remaining for promotions.',
            usage: 'Creates urgency for limited-time offers and events.'
        },
        'accordion': {
            title: 'Expandable Accordion',
            description: 'Collapsible content sections to save space.',
            usage: 'Good for FAQs or detailed information that can be hidden initially.'
        },
        
        // Commerce elements
        'product': {
            title: 'Product Display',
            description: 'Showcases a single product with image, price, and description.',
            usage: 'Highlight key features and include clear purchase button.'
        },
        'product-grid': {
            title: 'Product Grid',
            description: 'Multiple products arranged in a responsive grid layout.',
            usage: 'Great for showcasing collections or recommended items.'
        },
        'coupon': {
            title: 'Coupon Code',
            description: 'Promotional discount code in an attention-grabbing format.',
            usage: 'Make it easy to copy and clearly state terms or expiration.'
        },
        'testimonial': {
            title: 'Testimonial',
            description: 'Customer review or testimonial with attribution.',
            usage: 'Builds trust with authentic customer experiences and feedback.'
        },
        'ratings': {
            title: 'Star Ratings',
            description: 'Visual rating display using stars or other symbols.',
            usage: 'Shows product quality at a glance based on customer ratings.'
        },
        
        // Personalization elements
        'personalized-content': {
            title: 'Personalized Content',
            description: 'Dynamic content that changes based on recipient data.',
            usage: 'Insert merge tags like {First_Name} to personalize messages.'
        },
        'dynamic-content': {
            title: 'Dynamic Content',
            description: 'Content that displays differently based on rules or segments.',
            usage: 'Target specific audience segments with relevant messaging.'
        },
        'recommended-products': {
            title: 'Product Recommendations',
            description: 'Automated product suggestions based on customer behavior.',
            usage: 'Increases conversions by showing relevant items to each recipient.'
        },
        
        // Social elements
        'social-links': {
            title: 'Social Media Links',
            description: 'Icons linking to your social media profiles.',
            usage: 'Grows your social following and extends engagement beyond email.'
        },
        'instagram-feed': {
            title: 'Instagram Feed',
            description: 'Grid of recent Instagram posts from your account.',
            usage: 'Showcases your visual content and drives Instagram engagement.'
        },
        'twitter-feed': {
            title: 'Twitter Feed',
            description: 'Recent tweets or a specific Twitter post embed.',
            usage: 'Highlights conversations and timely updates from your account.'
        },
        'facebook-feed': {
            title: 'Facebook Posts',
            description: 'Embedded Facebook posts or content preview.',
            usage: 'Drives traffic to your Facebook page and extends content reach.'
        }
    };
    
    // Return enhanced description if available, otherwise use default
    if (enhancedDescriptions[elementType]) {
        return enhancedDescriptions[elementType];
    }
    
    // If no enhanced description found, use the element name as title
    result.title = defaultName;
    return result;
}

/**
 * Task 1.2: Setup drag handles for content blocks
 */
function setupDragHandles() {
    // Get all content blocks currently in the email
    const contentBlocks = document.querySelectorAll('.email-content-block');
    contentBlocks.forEach(addDragHandleToBlock);
    
    // Create a MutationObserver to watch for new blocks
    const emailDocument = document.getElementById('email-document');
    if (emailDocument) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.classList.contains('email-content-block')) {
                        addDragHandleToBlock(node);
                    }
                });
            });
        });
        
        observer.observe(emailDocument, { childList: true, subtree: true });
    }
}

/**
 * Add drag handle to a single content block
 */
function addDragHandleToBlock(block) {
    // Check if block already has a drag handle
    if (block.querySelector('.block-drag-handle')) return;
    
    // Create drag handle element
    const dragHandle = document.createElement('div');
    dragHandle.className = 'block-drag-handle';
    dragHandle.innerHTML = '<i class="fas fa-grip-vertical"></i>';
    dragHandle.title = 'Drag to reposition';
    
    // Append drag handle to the block
    block.appendChild(dragHandle);
    
    // Make the block draggable using the handle
    makeDraggable(block, dragHandle);
}

/**
 * Make an element draggable with a handle
 */
function makeDraggable(element, handle) {
    // We're just adding the handle UI here
    // The actual drag functionality would integrate with the existing
    // drag and drop system in the email builder
}

/**
 * Task 1.3: Setup dynamic properties panel
 */
function setupPropertiesPanel() {
    const emailCanvas = document.querySelector('.email-canvas');
    if (!emailCanvas) return;
    
    // REMOVED: Extra properties panel creation - using only the dynamic one
    // We're keeping references to the existing properties panel instead of creating a new one
    
    // Find the existing properties panel instead of creating a new one
    const propertiesPanel = document.querySelector('.properties-panel');
    if (propertiesPanel) {
        // Add close button functionality if panel exists
        const closeButton = propertiesPanel.querySelector('.close-properties');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                closePropertiesPanel();
            });
        }
    }
}

/**
 * Open properties panel for a specific element
 */
function openPropertiesPanel(element) {
    if (!element) return;
    
    const propertiesPanel = document.querySelector('.properties-panel');
    const emailCanvas = document.querySelector('.email-canvas');
    
    if (!propertiesPanel || !emailCanvas) return;
    
    // Get the element type
    const elementType = element.getAttribute('data-block-type');
    
    // Update panel title
    const panelTitle = propertiesPanel.querySelector('.properties-panel-title');
    if (panelTitle) {
        panelTitle.textContent = getElementTitle(elementType);
    }
    
    // Generate properties content based on element type
    const propertiesContent = propertiesPanel.querySelector('.properties-panel-content');
    if (propertiesContent) {
        propertiesContent.innerHTML = generatePropertiesContent(element, elementType);
    }
    
    // Show the panel
    propertiesPanel.classList.add('active');
    emailCanvas.classList.add('with-properties-panel');
    
    // Save reference to selected element
    propertiesPanel.setAttribute('data-target-element-id', element.id || '');
    
    // Initialize property controls
    initializePropertyControls(propertiesPanel, element);
}

/**
 * Close properties panel
 */
function closePropertiesPanel() {
    const propertiesPanel = document.querySelector('.properties-panel');
    const emailCanvas = document.querySelector('.email-canvas');
    
    if (!propertiesPanel || !emailCanvas) return;
    
    // Hide the panel
    propertiesPanel.classList.remove('active');
    emailCanvas.classList.remove('with-properties-panel');
    
    // Clear selected element reference
    propertiesPanel.setAttribute('data-target-element-id', '');
}

/**
 * Get title for element properties panel
 */
function getElementTitle(elementType) {
    const titles = {
        'preheader': 'Preheader Properties',
        'header': 'Header Properties',
        'hero': 'Hero Section Properties',
        'footer': 'Footer Properties',
        'single-column': 'Single Column Properties',
        'two-column': 'Two Column Properties',
        'three-column': 'Three Column Properties',
        'text': 'Text Block Properties',
        'image': 'Image Properties',
        'button': 'Button Properties',
        'video': 'Video Properties',
        'list': 'List Properties',
        'numbered-list': 'Numbered List Properties',
        'divider': 'Divider Properties',
        'spacer': 'Spacer Properties',
        'html': 'HTML Properties',
        'survey': 'Survey Properties',
        'timer': 'Timer Properties',
        'accordion': 'Accordion Properties',
        'product': 'Product Properties',
        'product-grid': 'Product Grid Properties',
        'coupon': 'Coupon Properties',
        'testimonial': 'Testimonial Properties',
        'ratings': 'Ratings Properties',
        'personalized-content': 'Personalized Content Properties',
        'dynamic-content': 'Dynamic Content Properties',
        'recommended-products': 'Product Recommendations Properties',
        'social-links': 'Social Links Properties',
        'instagram-feed': 'Instagram Feed Properties'
    };
    
    return titles[elementType] || 'Element Properties';
}

/**
 * Generate properties panel content based on element type
 */
function generatePropertiesContent(element, elementType) {
    // Default message if no element is selected
    if (!element || !elementType) {
        return '<div class="select-element-message"><p>Select an element to edit its properties</p></div>';
    }
    
    let content = '';
    
    // Common properties for all elements
    content += `
        <div class="property-group">
            <h4 class="property-group-title">General</h4>
            <div class="property-field">
                <label for="element-id">Element ID</label>
                <input type="text" id="element-id" value="${element.id || ''}" placeholder="Optional ID">
            </div>
            <div class="property-field">
                <label for="element-class">CSS Class</label>
                <input type="text" id="element-class" value="${element.className || ''}" placeholder="Optional CSS class">
            </div>
        </div>
    `;
    
    // Element-specific properties
    switch (elementType) {
        case 'text':
            content += generateTextProperties(element);
            break;
        case 'image':
            content += generateImageProperties(element);
            break;
        case 'button':
            content += generateButtonProperties(element);
            break;
        case 'header':
        case 'hero':
            content += generateHeaderProperties(element);
            break;
        case 'footer':
            content += generateFooterProperties(element);
            break;
        // Add more element types as needed
        default:
            content += generateDefaultProperties(element);
    }
    
    // Add spacing and padding controls for all elements
    content += generateSpacingProperties(element);
    
    return content;
}

/**
 * Generate text element properties
 */
function generateTextProperties(element) {
    const textContent = element.querySelector('.email-text')?.innerHTML || '';
    
    return `
        <div class="property-group">
            <h4 class="property-group-title">Text Content</h4>
            <div class="property-field">
                <label for="text-content">Text</label>
                <textarea id="text-content" rows="4">${textContent}</textarea>
            </div>
            <div class="property-field">
                <label for="text-color">Text Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="text-color-preview"></div>
                    <input type="text" id="text-color" value="#333333" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="font-size">Font Size</label>
                <select id="font-size">
                    <option value="12px">12px</option>
                    <option value="14px" selected>14px</option>
                    <option value="16px">16px</option>
                    <option value="18px">18px</option>
                    <option value="20px">20px</option>
                    <option value="24px">24px</option>
                </select>
            </div>
            <div class="property-field">
                <label for="text-align">Text Alignment</label>
                <select id="text-align">
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                    <option value="justify">Justify</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Generate image element properties
 */
function generateImageProperties(element) {
    const imgElement = element.querySelector('img');
    const imgSrc = imgElement ? imgElement.getAttribute('src') : '';
    const imgAlt = imgElement ? imgElement.getAttribute('alt') : '';
    
    return `
        <div class="property-group">
            <h4 class="property-group-title">Image</h4>
            <div class="property-field">
                <label for="image-src">Image URL</label>
                <input type="text" id="image-src" value="${imgSrc}" placeholder="Image URL">
            </div>
            <div class="property-field">
                <label for="image-alt">Alt Text</label>
                <input type="text" id="image-alt" value="${imgAlt}" placeholder="Image description">
            </div>
            <div class="property-field">
                <label for="image-link">Link URL (optional)</label>
                <input type="text" id="image-link" placeholder="https://...">
            </div>
            <div class="property-field">
                <label for="image-align">Alignment</label>
                <select id="image-align">
                    <option value="left">Left</option>
                    <option value="center" selected>Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Generate button element properties
 */
function generateButtonProperties(element) {
    const buttonElement = element.querySelector('.email-button');
    const buttonText = buttonElement ? buttonElement.textContent : 'Click Here';
    const buttonUrl = buttonElement ? buttonElement.getAttribute('href') : '#';
    
    return `
        <div class="property-group">
            <h4 class="property-group-title">Button</h4>
            <div class="property-field">
                <label for="button-text">Button Text</label>
                <input type="text" id="button-text" value="${buttonText}" placeholder="Button text">
            </div>
            <div class="property-field">
                <label for="button-url">Button URL</label>
                <input type="text" id="button-url" value="${buttonUrl}" placeholder="https://...">
            </div>
            <div class="property-field">
                <label for="button-color">Button Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="button-color-preview"></div>
                    <input type="text" id="button-color" value="#3f51b5" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="button-text-color">Text Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="button-text-color-preview"></div>
                    <input type="text" id="button-text-color" value="#ffffff" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="button-size">Button Size</label>
                <select id="button-size">
                    <option value="small">Small</option>
                    <option value="medium" selected>Medium</option>
                    <option value="large">Large</option>
                </select>
            </div>
            <div class="property-field">
                <label for="button-align">Alignment</label>
                <select id="button-align">
                    <option value="left">Left</option>
                    <option value="center" selected>Center</option>
                    <option value="right">Right</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Generate header element properties
 */
function generateHeaderProperties(element) {
    return `
        <div class="property-group">
            <h4 class="property-group-title">Header Style</h4>
            <div class="property-field">
                <label for="header-bg-color">Background Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="header-bg-color-preview"></div>
                    <input type="text" id="header-bg-color" value="#f5f5f5" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="header-height">Height</label>
                <select id="header-height">
                    <option value="60px">Compact (60px)</option>
                    <option value="80px" selected>Standard (80px)</option>
                    <option value="100px">Large (100px)</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Generate footer element properties
 */
function generateFooterProperties(element) {
    return `
        <div class="property-group">
            <h4 class="property-group-title">Footer Style</h4>
            <div class="property-field">
                <label for="footer-bg-color">Background Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="footer-bg-color-preview"></div>
                    <input type="text" id="footer-bg-color" value="#f5f5f5" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="footer-text-color">Text Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="footer-text-color-preview"></div>
                    <input type="text" id="footer-text-color" value="#666666" placeholder="Color hex code">
                </div>
            </div>
        </div>
    `;
}

/**
 * Generate default properties for any element type not specifically handled
 */
function generateDefaultProperties(element) {
    return `
        <div class="property-group">
            <h4 class="property-group-title">Layout</h4>
            <div class="property-field">
                <label for="background-color">Background Color</label>
                <div class="color-picker">
                    <div class="color-preview" id="background-color-preview"></div>
                    <input type="text" id="background-color" value="#ffffff" placeholder="Color hex code">
                </div>
            </div>
            <div class="property-field">
                <label for="border-style">Border Style</label>
                <select id="border-style">
                    <option value="none" selected>None</option>
                    <option value="solid">Solid</option>
                    <option value="dashed">Dashed</option>
                    <option value="dotted">Dotted</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Generate spacing properties for all elements
 */
function generateSpacingProperties(element) {
    return `
        <div class="property-group">
            <h4 class="property-group-title">Spacing</h4>
            <div class="property-field">
                <label for="padding-top">Padding Top</label>
                <select id="padding-top">
                    <option value="0">0px</option>
                    <option value="5px">5px</option>
                    <option value="10px" selected>10px</option>
                    <option value="15px">15px</option>
                    <option value="20px">20px</option>
                    <option value="30px">30px</option>
                </select>
            </div>
            <div class="property-field">
                <label for="padding-bottom">Padding Bottom</label>
                <select id="padding-bottom">
                    <option value="0">0px</option>
                    <option value="5px">5px</option>
                    <option value="10px" selected>10px</option>
                    <option value="15px">15px</option>
                    <option value="20px">20px</option>
                    <option value="30px">30px</option>
                </select>
            </div>
            <div class="property-field">
                <label for="margin-top">Margin Top</label>
                <select id="margin-top">
                    <option value="0" selected>0px</option>
                    <option value="5px">5px</option>
                    <option value="10px">10px</option>
                    <option value="15px">15px</option>
                    <option value="20px">20px</option>
                    <option value="30px">30px</option>
                </select>
            </div>
            <div class="property-field">
                <label for="margin-bottom">Margin Bottom</label>
                <select id="margin-bottom">
                    <option value="0" selected>0px</option>
                    <option value="5px">5px</option>
                    <option value="10px">10px</option>
                    <option value="15px">15px</option>
                    <option value="20px">20px</option>
                    <option value="30px">30px</option>
                </select>
            </div>
        </div>
    `;
}

/**
 * Initialize property controls (color pickers, etc.)
 */
function initializePropertyControls(panel, element) {
    // Initialize color pickers
    const colorPickers = panel.querySelectorAll('.color-picker input');
    colorPickers.forEach(picker => {
        const preview = picker.parentElement.querySelector('.color-preview');
        if (preview) {
            // Set initial color preview
            preview.style.backgroundColor = picker.value;
            
            // Update preview when color changes
            picker.addEventListener('input', () => {
                preview.style.backgroundColor = picker.value;
            });
        }
    });
    
    // Add event listeners for form controls
    const formControls = panel.querySelectorAll('input, select, textarea');
    formControls.forEach(control => {
        control.addEventListener('change', () => {
            updateElementProperty(element, control);
        });
    });
}

/**
 * Update element property based on control change
 */
function updateElementProperty(element, control) {
    if (!element || !control) return;
    
    const propertyId = control.id;
    const value = control.value;
    
    // Update element based on property id
    switch (propertyId) {
        case 'element-id':
            element.id = value;
            break;
        case 'element-class':
            element.className = value;
            break;
        case 'text-content':
            const textElement = element.querySelector('.email-text');
            if (textElement) textElement.innerHTML = value;
            break;
        case 'text-color':
            const textElements = element.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span');
            textElements.forEach(el => {
                el.style.color = value;
            });
            break;
        case 'font-size':
            const fontElements = element.querySelectorAll('p, span');
            fontElements.forEach(el => {
                el.style.fontSize = value;
            });
            break;
        case 'text-align':
            element.style.textAlign = value;
            break;
        case 'image-src':
            const imgElement = element.querySelector('img');
            if (imgElement) imgElement.src = value;
            break;
        case 'image-alt':
            const imgEl = element.querySelector('img');
            if (imgEl) imgEl.alt = value;
            break;
        case 'button-text':
            const buttonElement = element.querySelector('.email-button');
            if (buttonElement) buttonElement.textContent = value;
            break;
        case 'button-url':
            const buttonEl = element.querySelector('.email-button');
            if (buttonEl) buttonEl.href = value;
            break;
        case 'button-color':
            const button = element.querySelector('.email-button');
            if (button) button.style.backgroundColor = value;
            break;
        case 'background-color':
            element.style.backgroundColor = value;
            break;
        case 'padding-top':
            element.style.paddingTop = value;
            break;
        case 'padding-bottom':
            element.style.paddingBottom = value;
            break;
        case 'margin-top':
            element.style.marginTop = value;
            break;
        case 'margin-bottom':
            element.style.marginBottom = value;
            break;
        // Add more property updates as needed
    }
}

/**
 * Add event delegation for elements
 */
function addEventDelegation() {
    // Delegate click events for content blocks
    const emailDocument = document.getElementById('email-document');
    if (emailDocument) {
        emailDocument.addEventListener('click', function(e) {
            // Check if click is on content block or inside it
            const contentBlock = e.target.closest('.email-content-block');
            if (contentBlock) {
                // Check if click is on block actions or drag handle
                const isBlockAction = e.target.closest('.block-actions');
                const isDragHandle = e.target.closest('.block-drag-handle');
                
                // Don't open properties panel if clicking on actions or drag handle
                if (!isBlockAction && !isDragHandle) {
                    // Select the block and open properties panel
                    selectContentBlock(contentBlock);
                }
            }
        });
    }
    
    // Add escape key handler to close properties panel
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closePropertiesPanel();
        }
    });
}

/**
 * Select a content block and open its properties
 * Enhanced with better visual feedback and animations
 */
function selectContentBlock(block) {
    // Do nothing if block is already selected
    if (block.classList.contains('selected-block')) return;
    
    // Play selection sound effect for better feedback
    playSelectionSound();
    
    // Remove selection from all blocks with animation
    const allBlocks = document.querySelectorAll('.email-content-block');
    allBlocks.forEach(b => {
        if (b.classList.contains('selected-block')) {
            // Add transition class before removing selection
            b.classList.add('deselecting');
            // Remove the transition class after animation completes
            setTimeout(() => {
                b.classList.remove('deselecting');
                b.classList.remove('selected-block');
            }, 300);
        }
    });
    
    // Add selection to clicked block with subtle animation
    block.classList.add('selecting');
    block.classList.add('selected-block');
    
    // Remove animation class after it completes
    setTimeout(() => {
        block.classList.remove('selecting');
    }, 500);
    
    // Add visual cue to canvas
    const emailCanvas = document.querySelector('.email-canvas');
    if (emailCanvas) {
        emailCanvas.classList.add('element-selected');
        
        // Remove the visual cue after animation completes
        setTimeout(() => {
            emailCanvas.classList.remove('element-selected');
        }, 3000);
    }
    
    // Show block type in browser console for debugging
    console.log(`Selected ${block.getAttribute('data-block-type') || 'content'} block`);
    
    // Open properties panel for this block
    openPropertiesPanel(block);
}

/**
 * Play a subtle sound effect when selecting elements
 * Only plays if user has not disabled sounds
 */
function playSelectionSound() {
    // Check if sounds are enabled in user preferences
    const soundsEnabled = localStorage.getItem('email-editor-sounds-enabled') !== 'false';
    
    if (soundsEnabled) {
        try {
            // Create audio context if needed
            if (!window.audioContext) {
                window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Create oscillator for a subtle "click" sound
            const oscillator = window.audioContext.createOscillator();
            const gainNode = window.audioContext.createGain();
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(800, window.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, window.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.1, window.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, window.audioContext.currentTime + 0.1);
            
            oscillator.connect(gainNode);
            gainNode.connect(window.audioContext.destination);
            
            oscillator.start();
            oscillator.stop(window.audioContext.currentTime + 0.1);
        } catch (e) {
            // Silently fail if audio cannot be played
            console.debug('Selection sound could not be played:', e.message);
        }
    }
}

// Export functionality
window.emailInterfaceRefinements = {
    initEmailInterfaceRefinements,
    openPropertiesPanel,
    closePropertiesPanel,
    selectContentBlock
};
