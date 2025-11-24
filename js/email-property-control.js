/**
 * Email Property Control System
 * Dynamic property controls for email blocks
 */

const EmailPropertyControl = {
  // Active block being edited
  activeBlock: null,
  
  // Color palette for the system
  colorPalette: {
    primary: '#e8f24c', // Yellow accent from dashboard
    secondary: '#1e2127', // Dark background
    accent: '#c7d037', // Darker yellow for hover
    text: '#ffffff', // White text
    lightBg: 'rgba(255,255,255,0.08)', // Light overlay
    // Additional brand colors
    success: '#4caf50',
    warning: '#ff9800',
    danger: '#f44336',
    info: '#2196f3',
    light: '#f8f9fc',
    dark: '#5a5c69'
  },
  
  // Initialize the property control system
  init() {
    console.log("Initializing Email Property Control System...");
    this.createPropertyPanel();
    this.setupEventListeners();
    this.setupColorPalette();
  },
  
  // Create the property panel container
  createPropertyPanel() {
    // Check if panel already exists
    if (document.getElementById('block-properties-panel')) return;
    
    // Create panel container
    const panel = document.createElement('div');
    panel.id = 'block-properties-panel';
    panel.className = 'block-properties-panel';
    panel.innerHTML = `
      <div class="panel-header">
        <h3>Block Properties</h3>
        <button class="close-panel"><i class="material-icons">close</i></button>
      </div>
      <div class="panel-content">
        <p class="no-block-selected">Select a block to edit its properties</p>
        <div class="property-sections"></div>
      </div>
    `;
    
    // Add panel to document - position in the right sidebar container
    const propertiesContainer = document.getElementById('properties-panel-container');
    if (propertiesContainer) {
      propertiesContainer.appendChild(panel);
      // Add class to indicate it's in the sidebar
      panel.classList.add('in-sidebar');
    } else {
      // Fallback if container not found
      document.querySelector('.email-builder-main').appendChild(panel);
    }
    
    // Add event listener for close button
    panel.querySelector('.close-panel').addEventListener('click', () => {
      this.hidePropertyPanel();
    });
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Listen for block selection events
    document.addEventListener('click', e => {
      // Check if clicked inside email document
      const emailDocument = document.getElementById('email-document');
      if (emailDocument && emailDocument.contains(e.target)) {
        // Find closest block
        const block = e.target.closest('.email-content-block');
        if (block) {
          // Don't select if clicking a toolbar button
          if (!e.target.closest('.block-toolbar')) {
            this.showBlockProperties(block);
          }
        } else {
          // Clicked outside a block
          this.hidePropertyPanel();
        }
      }
    });
  },
  
  // Show properties for a specific block
  showBlockProperties(block) {
    if (!block) return;
    
    // Set as active block
    this.activeBlock = block;
    
    // Show panel
    const panel = document.getElementById('block-properties-panel');
    if (panel) {
      panel.classList.add('active');
      
      // Get block type
      const blockType = block.getAttribute('data-block-type') || 'unknown';
      
      // Get settings content area
      const settingsContent = panel.querySelector('.property-sections');
      if (settingsContent) {
        // Clear existing content
        settingsContent.innerHTML = '';
        
        // Add title
        const title = document.createElement('h4');
        title.textContent = this.formatBlockTypeName(blockType);
        settingsContent.appendChild(title);
        
        // Load appropriate properties based on block type
        this.loadBlockProperties(blockType, block, settingsContent);
      }
      
      // Hide "no block selected" message
      const noBlockMsg = panel.querySelector('.no-block-selected');
      if (noBlockMsg) {
        noBlockMsg.style.display = 'none';
      }
    }
  },
  
  // Format block type name for display
  formatBlockTypeName(blockType) {
    return blockType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  },
  
  // Hide the property panel
  hidePropertyPanel() {
    const panel = document.getElementById('block-properties-panel');
    if (panel) {
      panel.classList.remove('active');
      this.activeBlock = null;
      
      // Show "no block selected" message
      const noBlockMsg = panel.querySelector('.no-block-selected');
      if (noBlockMsg) {
        noBlockMsg.style.display = 'block';
      }
    }
  },
  
  // Load properties based on block type
  loadBlockProperties(blockType, block, container) {
    // Common properties for all blocks
    this.addCommonProperties(block, container);
    
    // Type-specific properties
    switch(blockType) {
      case 'text':
        this.addTextProperties(block, container);
        break;
      case 'image':
        this.addImageProperties(block, container);
        break;
      case 'button':
        this.addButtonProperties(block, container);
        break;
      case 'product':
        this.addProductProperties(block, container);
        break;
      case 'heading':
        this.addHeadingProperties(block, container);
        break;
      case 'social':
        this.addSocialProperties(block, container);
        break;
      case 'countdown':
        this.addCountdownProperties(block, container);
        break;
      case 'survey':
        this.addSurveyProperties(block, container);
        break;
      case 'video':
        this.addVideoProperties(block, container);
        break;
      default:
        this.addGenericProperties(block, container);
    }
  },
  
  // Add common properties for all blocks
  addCommonProperties(block, container) {
    // Create spacing section
    const spacingSection = this.createPropertySection('Spacing', container);
    
    // Add padding controls
    spacingSection.innerHTML += `
      <div class="property-row">
        <label>Padding</label>
        <div class="control-group">
          <div class="input-group">
            <input type="number" min="0" max="100" value="10" data-property="padding-top">
            <span>Top</span>
          </div>
          <div class="input-group">
            <input type="number" min="0" max="100" value="10" data-property="padding-right">
            <span>Right</span>
          </div>
          <div class="input-group">
            <input type="number" min="0" max="100" value="10" data-property="padding-bottom">
            <span>Bottom</span>
          </div>
          <div class="input-group">
            <input type="number" min="0" max="100" value="10" data-property="padding-left">
            <span>Left</span>
          </div>
        </div>
      </div>
    `;
    
    // Add margin controls
    spacingSection.innerHTML += `
      <div class="property-row">
        <label>Margin</label>
        <div class="control-group">
          <div class="input-group">
            <input type="number" min="0" max="100" value="0" data-property="margin-top">
            <span>Top</span>
          </div>
          <div class="input-group">
            <input type="number" min="0" max="100" value="0" data-property="margin-bottom">
            <span>Bottom</span>
          </div>
        </div>
      </div>
    `;
    
    // Create background section
    const backgroundSection = this.createPropertySection('Background', container);
    
    // Add background color picker
    backgroundSection.innerHTML += `
      <div class="property-row">
        <label>Background Color</label>
        <div class="color-picker-control">
          <div class="color-preview" style="background-color: transparent;"></div>
          <input type="text" value="transparent" data-property="background-color">
          <div class="color-palette"></div>
        </div>
      </div>
    `;
    
    // Add background style
    backgroundSection.innerHTML += `
      <div class="property-row">
        <label>Background Style</label>
        <select data-property="background-style">
          <option value="solid">Solid Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </div>
    `;
    
    // Create border section
    const borderSection = this.createPropertySection('Border', container);
    
    // Add border controls
    borderSection.innerHTML += `
      <div class="property-row">
        <label>Border Style</label>
        <select data-property="border-style">
          <option value="none">None</option>
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
        </select>
      </div>
      
      <div class="property-row">
        <label>Border Width</label>
        <div class="input-group">
          <input type="number" min="0" max="20" value="0" data-property="border-width">
          <span>px</span>
        </div>
      </div>
      
      <div class="property-row">
        <label>Border Color</label>
        <div class="color-picker-control">
          <div class="color-preview" style="background-color: #000000;"></div>
          <input type="text" value="#000000" data-property="border-color">
          <div class="color-palette"></div>
        </div>
      </div>
      
      <div class="property-row">
        <label>Border Radius</label>
        <div class="input-group">
          <input type="number" min="0" max="50" value="0" data-property="border-radius">
          <span>px</span>
        </div>
      </div>
    `;
    
    // Attach event listeners to all inputs
    this.attachPropertyEventListeners(container, block);
  },

  // Create a property section with title
  createPropertySection(title, container) {
    const section = document.createElement('div');
    section.className = 'property-section';
    
    const sectionTitle = document.createElement('h5');
    sectionTitle.textContent = title;
    section.appendChild(sectionTitle);
    
    container.appendChild(section);
    return section;
  },
  
  // Attach event listeners to property inputs
  attachPropertyEventListeners(container, block) {
    // Handle input changes
    const inputs = container.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('change', e => {
        const property = e.target.getAttribute('data-property');
        const value = e.target.value;
        
        if (property && block) {
          // Update block style
          this.updateBlockProperty(block, property, value);
        }
      });
    });
    
    // Handle color picker clicks
    const colorPickers = container.querySelectorAll('.color-picker-control');
    colorPickers.forEach(picker => {
      const preview = picker.querySelector('.color-preview');
      const input = picker.querySelector('input');
      const palette = picker.querySelector('.color-palette');
      
      // Show palette on click
      preview.addEventListener('click', () => {
        // Toggle palette visibility
        palette.style.display = palette.style.display === 'flex' ? 'none' : 'flex';
        
        // Load colors into palette if empty
        if (palette.children.length === 0) {
          this.loadColorPalette(palette, input);
        }
      });
    });
  },
  
  // Setup color palette system
  setupColorPalette() {
    // Check for saved palette
    const savedPalette = localStorage.getItem('email_color_palette');
    if (savedPalette) {
      try {
        const palette = JSON.parse(savedPalette);
        Object.assign(this.colorPalette, palette);
      } catch(e) {
        console.error('Error loading color palette', e);
      }
    }
  },
  
  // Load color palette into a color picker
  loadColorPalette(paletteContainer, input) {
    // Clear existing content
    paletteContainer.innerHTML = '';
    
    // Add all palette colors
    Object.entries(this.colorPalette).forEach(([name, color]) => {
      const swatch = document.createElement('div');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = color;
      swatch.title = name;
      
      // Add click event
      swatch.addEventListener('click', () => {
        input.value = color;
        input.dispatchEvent(new Event('change'));
        paletteContainer.style.display = 'none';
      });
      
      paletteContainer.appendChild(swatch);
    });
    
    // Add transparent option
    const transparent = document.createElement('div');
    transparent.className = 'color-swatch transparent';
    transparent.title = 'Transparent';
    transparent.addEventListener('click', () => {
      input.value = 'transparent';
      input.dispatchEvent(new Event('change'));
      paletteContainer.style.display = 'none';
    });
    paletteContainer.appendChild(transparent);
    
    // Add custom color option
    const custom = document.createElement('div');
    custom.className = 'color-swatch custom';
    custom.innerHTML = '+';
    custom.title = 'Custom Color';
    custom.addEventListener('click', () => {
      const colorPicker = document.createElement('input');
      colorPicker.type = 'color';
      colorPicker.value = input.value === 'transparent' ? '#ffffff' : input.value;
      
      colorPicker.addEventListener('change', () => {
        input.value = colorPicker.value;
        input.dispatchEvent(new Event('change'));
        paletteContainer.style.display = 'none';
      });
      
      colorPicker.click();
    });
    paletteContainer.appendChild(custom);
  },
  
  // Update a block property
  updateBlockProperty(block, property, value) {
    if (!block) return;
    
    // Get settings object
    let settings = {};
    try {
      settings = JSON.parse(block.getAttribute('data-block-settings') || '{}');
    } catch(e) {
      console.error('Error parsing block settings', e);
    }
    
    // Update setting
    settings[property] = value;
    
    // Save settings back to block
    block.setAttribute('data-block-settings', JSON.stringify(settings));
    
    // Apply style to block
    this.applyBlockStyles(block, settings);
  },
  
  // Apply styles to a block based on settings
  applyBlockStyles(block, settings) {
    // Get block content
    const content = block.querySelector('.block-content');
    if (!content) return;
    
    // Apply spacing properties
    if (settings['padding-top']) content.style.paddingTop = settings['padding-top'] + 'px';
    if (settings['padding-right']) content.style.paddingRight = settings['padding-right'] + 'px';
    if (settings['padding-bottom']) content.style.paddingBottom = settings['padding-bottom'] + 'px';
    if (settings['padding-left']) content.style.paddingLeft = settings['padding-left'] + 'px';
    
    if (settings['margin-top']) content.style.marginTop = settings['margin-top'] + 'px';
    if (settings['margin-bottom']) content.style.marginBottom = settings['margin-bottom'] + 'px';
    
    // Apply background properties
    if (settings['background-color']) content.style.backgroundColor = settings['background-color'];
    
    // Apply border properties
    if (settings['border-style']) content.style.borderStyle = settings['border-style'];
    if (settings['border-width']) content.style.borderWidth = settings['border-width'] + 'px';
    if (settings['border-color']) content.style.borderColor = settings['border-color'];
    if (settings['border-radius']) content.style.borderRadius = settings['border-radius'] + 'px';
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the email marketing page
  if (document.getElementById('email-document')) {
    // Initialize after a short delay to ensure all dependencies are loaded
    setTimeout(() => {
      EmailPropertyControl.init();
    }, 700);
  }
});
