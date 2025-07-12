/**
 * Email Block Properties
 * Type-specific property controls for email blocks
 */

// Extend EmailPropertyControl with specific block type properties
(function() {
  // Wait for EmailPropertyControl to be defined
  function initializeBlockProperties() {
    if (typeof EmailPropertyControl === 'undefined') {
      setTimeout(initializeBlockProperties, 100);
      return;
    }
    
    // Add text block specific properties
    EmailPropertyControl.addTextProperties = function(block, container) {
      // Create text styling section
      const textSection = this.createPropertySection('Text Styling', container);
      
      // Font family
      textSection.innerHTML += `
        <div class="property-row">
          <label>Font Family</label>
          <select data-property="font-family">
            <option value="Arial, sans-serif">Arial</option>
            <option value="'Helvetica Neue', Helvetica, sans-serif">Helvetica</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', Times, serif">Times New Roman</option>
            <option value="Verdana, Geneva, sans-serif">Verdana</option>
            <option value="'Open Sans', sans-serif">Open Sans</option>
            <option value="'Roboto', sans-serif">Roboto</option>
          </select>
        </div>
      `;
      
      // Font size
      textSection.innerHTML += `
        <div class="property-row">
          <label>Font Size</label>
          <div class="input-group">
            <input type="number" min="8" max="72" value="14" data-property="font-size">
            <span>px</span>
          </div>
        </div>
      `;
      
      // Line height
      textSection.innerHTML += `
        <div class="property-row">
          <label>Line Height</label>
          <div class="input-group">
            <input type="number" min="1" max="3" step="0.1" value="1.5" data-property="line-height">
            <span>em</span>
          </div>
        </div>
      `;
      
      // Text color
      textSection.innerHTML += `
        <div class="property-row">
          <label>Text Color</label>
          <div class="color-picker-control">
            <div class="color-preview" style="background-color: #ffffff;"></div>
            <input type="text" value="#ffffff" data-property="color">
            <div class="color-palette"></div>
          </div>
        </div>
      `;
      
      // Text align
      textSection.innerHTML += `
        <div class="property-row">
          <label>Text Alignment</label>
          <div class="button-group">
            <button data-value="left" data-property="text-align" class="active"><i class="material-icons">format_align_left</i></button>
            <button data-value="center" data-property="text-align"><i class="material-icons">format_align_center</i></button>
            <button data-value="right" data-property="text-align"><i class="material-icons">format_align_right</i></button>
            <button data-value="justify" data-property="text-align"><i class="material-icons">format_align_justify</i></button>
          </div>
        </div>
      `;
      
      // Add event listeners to button groups
      const buttons = textSection.querySelectorAll('.button-group button');
      buttons.forEach(button => {
        button.addEventListener('click', e => {
          const property = button.getAttribute('data-property');
          const value = button.getAttribute('data-value');
          
          // Update active state
          buttons.forEach(b => {
            if (b.getAttribute('data-property') === property) {
              b.classList.remove('active');
            }
          });
          button.classList.add('active');
          
          // Update property
          this.updateBlockProperty(block, property, value);
        });
      });
      
      this.attachPropertyEventListeners(textSection, block);
    };
    
    // Add image block specific properties
    EmailPropertyControl.addImageProperties = function(block, container) {
      // Create image section
      const imageSection = this.createPropertySection('Image Settings', container);
      
      // Image source
      imageSection.innerHTML += `
        <div class="property-row">
          <label>Image URL</label>
          <input type="text" value="https://via.placeholder.com/600x300" data-property="src">
        </div>
      `;
      
      // Alt text
      imageSection.innerHTML += `
        <div class="property-row">
          <label>Alt Text</label>
          <input type="text" value="Image description" data-property="alt-text">
        </div>
      `;
      
      // Image size
      imageSection.innerHTML += `
        <div class="property-row">
          <label>Image Size</label>
          <select data-property="image-size">
            <option value="auto">Original Size</option>
            <option value="contain">Fit Container</option>
            <option value="cover">Fill Container</option>
            <option value="custom">Custom Size</option>
          </select>
        </div>
      `;
      
      // Custom width/height (initially hidden)
      imageSection.innerHTML += `
        <div class="property-row size-custom" style="display: none;">
          <label>Dimensions</label>
          <div class="control-group">
            <div class="input-group">
              <input type="number" min="10" max="1200" value="600" data-property="width">
              <span>W</span>
            </div>
            <div class="input-group">
              <input type="number" min="10" max="1200" value="300" data-property="height">
              <span>H</span>
            </div>
          </div>
        </div>
      `;
      
      // Image alignment
      imageSection.innerHTML += `
        <div class="property-row">
          <label>Alignment</label>
          <div class="button-group">
            <button data-value="flex-start" data-property="align-items" class="active"><i class="material-icons">align_horizontal_left</i></button>
            <button data-value="center" data-property="align-items"><i class="material-icons">align_horizontal_center</i></button>
            <button data-value="flex-end" data-property="align-items"><i class="material-icons">align_horizontal_right</i></button>
          </div>
        </div>
      `;
      
      // Add link section
      const linkSection = this.createPropertySection('Link Settings', container);
      
      // Link URL
      linkSection.innerHTML += `
        <div class="property-row">
          <label>Link URL</label>
          <input type="text" value="" placeholder="https://example.com" data-property="link-url">
        </div>
      `;
      
      // Link target
      linkSection.innerHTML += `
        <div class="property-row">
          <label>Open Link In</label>
          <select data-property="link-target">
            <option value="_self">Same Window</option>
            <option value="_blank">New Window</option>
          </select>
        </div>
      `;
      
      this.attachPropertyEventListeners(container, block);
      
      // Add special handling for image size select
      const sizeSelect = imageSection.querySelector('select[data-property="image-size"]');
      const customSizeRow = imageSection.querySelector('.size-custom');
      
      if (sizeSelect && customSizeRow) {
        sizeSelect.addEventListener('change', () => {
          customSizeRow.style.display = sizeSelect.value === 'custom' ? 'block' : 'none';
        });
      }
    };
    
    // Add button block specific properties
    EmailPropertyControl.addButtonProperties = function(block, container) {
      // Create button section
      const buttonSection = this.createPropertySection('Button Style', container);
      
      // Button text
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Button Text</label>
          <input type="text" value="Click Here" data-property="button-text">
        </div>
      `;
      
      // Button URL
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Button URL</label>
          <input type="text" value="#" placeholder="https://example.com" data-property="button-url">
        </div>
      `;
      
      // Button style
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Button Style</label>
          <select data-property="button-style">
            <option value="solid">Solid</option>
            <option value="outline">Outline</option>
            <option value="link">Text Link</option>
          </select>
        </div>
      `;
      
      // Button colors
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Background Color</label>
          <div class="color-picker-control">
            <div class="color-preview" style="background-color: #e8f24c;"></div>
            <input type="text" value="#e8f24c" data-property="background-color">
            <div class="color-palette"></div>
          </div>
        </div>
        
        <div class="property-row">
          <label>Text Color</label>
          <div class="color-picker-control">
            <div class="color-preview" style="background-color: #000000;"></div>
            <input type="text" value="#000000" data-property="color">
            <div class="color-palette"></div>
          </div>
        </div>
      `;
      
      // Button size
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Button Size</label>
          <select data-property="button-size">
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      `;
      
      // Button width
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Button Width</label>
          <select data-property="button-width">
            <option value="auto">Auto</option>
            <option value="full">Full Width</option>
          </select>
        </div>
      `;
      
      // Button alignment
      buttonSection.innerHTML += `
        <div class="property-row">
          <label>Alignment</label>
          <div class="button-group">
            <button data-value="flex-start" data-property="justify-content" class="active"><i class="material-icons">align_horizontal_left</i></button>
            <button data-value="center" data-property="justify-content"><i class="material-icons">align_horizontal_center</i></button>
            <button data-value="flex-end" data-property="justify-content"><i class="material-icons">align_horizontal_right</i></button>
          </div>
        </div>
      `;
      
      // Hover effects section
      const hoverSection = this.createPropertySection('Hover Effects', container);
      
      // Hover background color
      hoverSection.innerHTML += `
        <div class="property-row">
          <label>Hover Background Color</label>
          <div class="color-picker-control">
            <div class="color-preview" style="background-color: #c7d037;"></div>
            <input type="text" value="#c7d037" data-property="hover-background-color">
            <div class="color-palette"></div>
          </div>
        </div>
      `;
      
      // Hover text color
      hoverSection.innerHTML += `
        <div class="property-row">
          <label>Hover Text Color</label>
          <div class="color-picker-control">
            <div class="color-preview" style="background-color: #000000;"></div>
            <input type="text" value="#000000" data-property="hover-color">
            <div class="color-palette"></div>
          </div>
        </div>
      `;
      
      this.attachPropertyEventListeners(container, block);
    };
    
    // Add product block specific properties
    EmailPropertyControl.addProductProperties = function(block, container) {
      // Create product section
      const productSection = this.createPropertySection('Product Settings', container);
      
      // Product name
      productSection.innerHTML += `
        <div class="property-row">
          <label>Product Name</label>
          <input type="text" value="Product Name" data-property="product-name">
        </div>
      `;
      
      // Product description
      productSection.innerHTML += `
        <div class="property-row">
          <label>Description</label>
          <textarea data-property="product-description" rows="3">Product description goes here.</textarea>
        </div>
      `;
      
      // Product price
      productSection.innerHTML += `
        <div class="property-row">
          <label>Price</label>
          <div class="input-group">
            <input type="text" value="99.99" data-property="product-price">
            <span>$</span>
          </div>
        </div>
      `;
      
      // Product image
      productSection.innerHTML += `
        <div class="property-row">
          <label>Product Image URL</label>
          <input type="text" value="https://via.placeholder.com/300x300" data-property="product-image">
        </div>
      `;
      
      // Button text
      productSection.innerHTML += `
        <div class="property-row">
          <label>Button Text</label>
          <input type="text" value="Shop Now" data-property="button-text">
        </div>
      `;
      
      // Button URL
      productSection.innerHTML += `
        <div class="property-row">
          <label>Button URL</label>
          <input type="text" value="#" placeholder="https://example.com/product" data-property="button-url">
        </div>
      `;
      
      // Layout section
      const layoutSection = this.createPropertySection('Layout Options', container);
      
      // Layout style
      layoutSection.innerHTML += `
        <div class="property-row">
          <label>Layout Style</label>
          <select data-property="layout-style">
            <option value="horizontal">Image Left, Details Right</option>
            <option value="horizontal-reverse">Image Right, Details Left</option>
            <option value="vertical">Image Top, Details Bottom</option>
          </select>
        </div>
      `;
      
      // Image size
      layoutSection.innerHTML += `
        <div class="property-row">
          <label>Image Size</label>
          <select data-property="image-size">
            <option value="small">Small (25%)</option>
            <option value="medium" selected>Medium (33%)</option>
            <option value="large">Large (50%)</option>
          </select>
        </div>
      `;
      
      this.attachPropertyEventListeners(container, block);
    };

    // Add generic properties for other block types
    EmailPropertyControl.addGenericProperties = function(block, container) {
      const contentSection = this.createPropertySection('Content', container);
      
      // Get a sample editable element from block
      const editable = block.querySelector('.editable');
      if (editable) {
        contentSection.innerHTML += `
          <div class="property-row">
            <label>Content</label>
            <textarea data-property="content" rows="4">${editable.innerText}</textarea>
          </div>
        `;
      }
      
      this.attachPropertyEventListeners(contentSection, block);
    };
  
    // Initialize
    console.log("Initializing Block Properties System...");
  }
  
  // Start initialization
  initializeBlockProperties();
})();
