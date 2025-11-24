/**
 * Email Block Structure Overhaul
 * Implements true content blocks and block categorization
 */

const EmailBlockStructure = {
  // Track all created blocks
  blocks: {},
  
  // Block categories
  categories: {
    visual: {
      name: "Visual",
      icon: "image",
      blocks: ["image", "video", "divider", "spacer"]
    },
    structural: {
      name: "Structural", 
      icon: "view_column",
      blocks: ["header", "footer", "preheader", "column_1", "column_2", "column_3"]
    },
    interactive: {
      name: "Interactive",
      icon: "touch_app",
      blocks: ["button", "social", "survey", "form", "menu"]
    },
    dynamic: {
      name: "Dynamic",
      icon: "cached", 
      blocks: ["personalized_text", "product", "product_grid", "countdown", "abandoned_cart"]
    },
    content: {
      name: "Content",
      icon: "text_fields",
      blocks: ["text", "heading", "list", "quote"]
    }
  },
  
  // Initialize the block structure system
  init() {
    console.log("Initializing Email Block Structure System...");
    this.setupCategories();
    this.enhanceExistingBlocks();
    this.attachDragDropHandlers();
    this.setupBlockPropertySystem();
  },
  
  // Setup categorized blocks in the sidebar
  setupCategories() {
    // Get sidebar content container
    const sidebarContent = document.querySelector('.email-elements-sidebar .sidebar-content');
    if (!sidebarContent) return;
    
    // Clear existing content
    sidebarContent.innerHTML = '';
    
    // Create categories with blocks
    Object.keys(this.categories).forEach(categoryKey => {
      const category = this.categories[categoryKey];
      
      // Create category container
      const categoryEl = document.createElement('div');
      categoryEl.className = 'element-category';
      
      // Create category title
      const titleEl = document.createElement('div');
      titleEl.className = 'category-title';
      titleEl.textContent = category.name.toUpperCase();
      categoryEl.appendChild(titleEl);
      
      // Create blocks for this category
      category.blocks.forEach(blockType => {
        const blockEl = this.createBlockElement(blockType, categoryKey);
        categoryEl.appendChild(blockEl);
      });
      
      // Add the category to sidebar
      sidebarContent.appendChild(categoryEl);
    });
  },
  
  // Create a sidebar element for a block type
  createBlockElement(blockType, category) {
    const element = document.createElement('div');
    element.className = 'element-item';
    element.setAttribute('draggable', 'true');
    element.setAttribute('data-element-type', blockType);
    element.setAttribute('data-category', category);
    
    // Set descriptive tooltips based on block type
    const tooltips = {
      // Visual blocks
      image: "Image Block\nAdd images with caption and link options",
      video: "Video Block\nEmbed videos with play button and fallback image",
      divider: "Divider\nAdd horizontal line with customizable style",
      spacer: "Spacer\nAdd vertical spacing with precise height control",
      
      // Structural blocks
      header: "Header Block\nAdd logo, navigation, and header content",
      footer: "Footer Block\nAdd contact info, social links, and legal text",
      preheader: "Preheader\nHidden text shown in email previews",
      column_1: "Single Column\nFull-width content layout",
      column_2: "Two Columns\nSplit content into two equal columns",
      column_3: "Three Columns\nSplit content into three equal columns",
      
      // Interactive blocks
      button: "Button\nAdd call-to-action button with customizable style",
      social: "Social Links\nAdd social media buttons with icons",
      survey: "Survey Block\nAdd simple survey questions and rating options",
      form: "Form Block\nAdd input fields for subscriber feedback",
      menu: "Menu Block\nAdd navigation menu with links",
      
      // Dynamic blocks
      personalized_text: "Personalized Text\nDynamic content with recipient data",
      product: "Product Block\nDisplay product with image, price, and button",
      product_grid: "Product Grid\nDisplay multiple products in a grid layout",
      countdown: "Countdown Timer\nAdd animated countdown to deadline",
      abandoned_cart: "Abandoned Cart\nDynamic products from abandoned cart",
      
      // Content blocks
      text: "Text Block\nAdd paragraph text with formatting options",
      heading: "Heading\nAdd headings with different levels and styles",
      list: "List Block\nAdd ordered or unordered lists",
      quote: "Quote Block\nAdd styled blockquote with attribution"
    };
    
    // Set tooltip
    element.setAttribute('data-tooltip', tooltips[blockType] || blockType.replace('_', ' '));
    
    // Add Material Icon based on block type
    const iconMap = {
      // Visual blocks
      image: "image",
      video: "videocam",
      divider: "remove",
      spacer: "space_bar",
      
      // Structural blocks
      header: "web_asset",
      footer: "call_to_action",
      preheader: "visibility_off",
      column_1: "view_stream",
      column_2: "view_week",
      column_3: "view_column",
      
      // Interactive blocks
      button: "smart_button",
      social: "share",
      survey: "poll",
      form: "input",
      menu: "menu",
      
      // Dynamic blocks
      personalized_text: "person",
      product: "shopping_bag",
      product_grid: "dashboard",
      countdown: "hourglass_top",
      abandoned_cart: "shopping_cart",
      
      // Content blocks
      text: "text_fields",
      heading: "title",
      list: "format_list_bulleted",
      quote: "format_quote"
    };
    
    // Create icon
    const icon = document.createElement('i');
    icon.className = 'material-icons'; // Using Material Icons
    icon.textContent = iconMap[blockType] || 'widgets';
    element.appendChild(icon);
    
    return element;
  },
  
  // Convert existing blocks to true block structure
  enhanceExistingBlocks() {
    const emailDocument = document.getElementById('email-document');
    if (!emailDocument) return;
    
    // Get all content blocks in the email
    const contentBlocks = emailDocument.querySelectorAll('.email-content-block');
    
    // Enhance each block
    contentBlocks.forEach(block => {
      // Skip already enhanced blocks
      if (block.getAttribute('data-enhanced')) return;
      
      // Assign unique ID if not present
      if (!block.id) {
        block.id = 'block_' + Math.random().toString(36).substring(2, 11);
      }
      
      // Store in blocks registry
      this.blocks[block.id] = {
        id: block.id,
        type: block.getAttribute('data-block-type') || 'unknown',
        element: block
      };
      
      // Mark as enhanced
      block.setAttribute('data-enhanced', 'true');
      
      // Add data attributes for block type and settings
      if (!block.getAttribute('data-block-settings')) {
        block.setAttribute('data-block-settings', JSON.stringify({}));
      }
      
      // Add block toolbar if not present
      if (!block.querySelector('.block-toolbar')) {
        this.addBlockToolbar(block);
      }
    });
  },
  
  // Add a toolbar to each block
  addBlockToolbar(block) {
    const toolbar = document.createElement('div');
    toolbar.className = 'block-toolbar';
    
    // Add control buttons
    toolbar.innerHTML = `
      <button class="block-move" title="Move block"><i class="material-icons">drag_indicator</i></button>
      <button class="block-settings" title="Block settings"><i class="material-icons">settings</i></button>
      <button class="block-duplicate" title="Duplicate block"><i class="material-icons">content_copy</i></button>
      <button class="block-delete" title="Delete block"><i class="material-icons">delete</i></button>
    `;
    
    // Add toolbar to block
    block.insertBefore(toolbar, block.firstChild);
    
    // Add event listeners
    toolbar.querySelector('.block-settings').addEventListener('click', () => {
      EmailPropertyControl.showBlockProperties(block);
    });
    
    toolbar.querySelector('.block-duplicate').addEventListener('click', () => {
      this.duplicateBlock(block);
    });
    
    toolbar.querySelector('.block-delete').addEventListener('click', () => {
      this.deleteBlock(block);
    });
  },
  
  // Attach drag and drop handlers
  attachDragDropHandlers() {
    // Set up drag events for sidebar elements
    const elements = document.querySelectorAll('.element-item');
    elements.forEach(element => {
      element.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', element.getAttribute('data-element-type'));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
    
    // Set up drop zone in email document
    const emailDocument = document.getElementById('email-document');
    if (emailDocument) {
      emailDocument.addEventListener('dragover', e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
      });
      
      emailDocument.addEventListener('drop', e => {
        e.preventDefault();
        const blockType = e.dataTransfer.getData('text/plain');
        if (blockType) {
          this.createNewBlock(blockType, emailDocument);
        }
      });
    }
  },
  
  // Create a new block from type
  createNewBlock(blockType, container) {
    // Create block element
    const block = document.createElement('div');
    block.className = 'email-content-block';
    block.setAttribute('data-block-type', blockType);
    
    // Generate unique ID
    const blockId = 'block_' + Math.random().toString(36).substring(2, 11);
    block.id = blockId;
    
    // Set initial settings
    block.setAttribute('data-block-settings', JSON.stringify({}));
    
    // Add block content based on type
    block.innerHTML = this.getBlockTemplate(blockType);
    
    // Add block to container
    container.appendChild(block);
    
    // Register block
    this.blocks[blockId] = {
      id: blockId,
      type: blockType,
      element: block
    };
    
    // Add toolbar
    this.addBlockToolbar(block);
    
    // Mark as enhanced
    block.setAttribute('data-enhanced', 'true');
    
    // Show properties panel
    EmailPropertyControl.showBlockProperties(block);
    
    return block;
  },
  
  // Get HTML template for a block type
  getBlockTemplate(blockType) {
    const templates = {
      // Visual blocks
      image: `
        <div class="block-content image-block">
          <img src="https://via.placeholder.com/600x300" alt="Image description">
          <p class="image-caption editable">Image caption</p>
        </div>
      `,
      
      video: `
        <div class="block-content video-block">
          <div class="video-placeholder">
            <img src="https://via.placeholder.com/600x400" alt="Video thumbnail">
            <div class="play-button"><i class="material-icons">play_arrow</i></div>
          </div>
          <p class="video-caption editable">Video caption</p>
        </div>
      `,
      
      // Content blocks
      text: `
        <div class="block-content text-block">
          <p class="editable">Your text goes here. Click to edit.</p>
        </div>
      `,
      
      heading: `
        <div class="block-content heading-block">
          <h2 class="editable">Heading text</h2>
        </div>
      `,
      
      // Interactive blocks
      button: `
        <div class="block-content button-block">
          <a href="#" class="email-button editable">Click Here</a>
        </div>
      `,
      
      // Dynamic blocks
      product: `
        <div class="block-content product-block">
          <div class="product-image">
            <img src="https://via.placeholder.com/300x300" alt="Product image">
          </div>
          <div class="product-info">
            <h3 class="product-title editable">Product Name</h3>
            <p class="product-description editable">Product description goes here.</p>
            <p class="product-price">$99.99</p>
            <a href="#" class="product-button editable">Shop Now</a>
          </div>
        </div>
      `,
      
      // Default template
      default: `
        <div class="block-content">
          <p class="editable">New ${blockType.replace('_', ' ')} block</p>
        </div>
      `
    };
    
    return templates[blockType] || templates.default;
  },
  
  // Duplicate a block
  duplicateBlock(block) {
    const blockType = block.getAttribute('data-block-type');
    const settings = JSON.parse(block.getAttribute('data-block-settings') || '{}');
    
    // Create clone
    const clone = block.cloneNode(true);
    
    // Generate new ID
    const blockId = 'block_' + Math.random().toString(36).substring(2, 11);
    clone.id = blockId;
    
    // Insert after original
    block.parentNode.insertBefore(clone, block.nextSibling);
    
    // Register block
    this.blocks[blockId] = {
      id: blockId,
      type: blockType,
      element: clone
    };
    
    // Re-attach event listeners
    this.enhanceExistingBlocks();
  },
  
  // Delete a block
  deleteBlock(block) {
    // Ask for confirmation
    if (confirm('Are you sure you want to delete this block?')) {
      // Remove from registry
      delete this.blocks[block.id];
      
      // Remove from DOM
      block.parentNode.removeChild(block);
    }
  },
  
  // Setup block property system
  setupBlockPropertySystem() {
    // Create connection to property control system
    document.addEventListener('block-selected', e => {
      const blockId = e.detail.blockId;
      const block = this.blocks[blockId]?.element;
      
      if (block) {
        EmailPropertyControl.showBlockProperties(block);
      }
    });
  }
};

// Initialize on document load
document.addEventListener('DOMContentLoaded', function() {
  // Check if we're on the email marketing page
  if (document.getElementById('email-document')) {
    // Initialize after a short delay to ensure all dependencies are loaded
    setTimeout(() => {
      EmailBlockStructure.init();
    }, 500);
  }
});
