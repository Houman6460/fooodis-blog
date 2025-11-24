/**
 * Email Icon Replacement
 * Replaces the default Font Awesome icons with more distinct Material Design icons
 * for better visual differentiation between email elements
 * 
 * v2.0 - Removes the orange icon set and prevents their recreation
 */

document.addEventListener('DOMContentLoaded', function() {
  // Enhanced icon mappings
  const iconMappings = {
    // Structure section
    'preheader': 'format_align_center',
    'header': 'web_asset',
    'hero': 'panorama',
    'footer': 'call_to_action',
    
    // Layout section
    'single-column': 'view_stream',
    'two-column': 'view_week',
    'three-column': 'view_column',
    
    // Content section
    'text': 'text_fields',
    'image': 'image',
    'button': 'smart_button',
    'video': 'videocam',
    'list': 'format_list_bulleted',
    'numbered-list': 'format_list_numbered',
    'divider': 'horizontal_rule',
    'spacer': 'space_bar',
    'html': 'code',
    
    // Interactive section
    'survey': 'poll',
    'timer': 'timer',
    'accordion': 'expand_more',
    
    // Commerce section
    'product': 'inventory_2',
    'product-grid': 'grid_view',
    'coupon': 'local_offer',
    'testimonial': 'format_quote', 
    'ratings': 'star_rate',
    
    // Personalization section
    'personalized-content': 'person',
    'dynamic-content': 'dynamic_feed',
    'recommended-products': 'recommend',
    
    // Social section
    'social-links': 'share',
    'instagram-feed': 'photo_camera',
    'social-follow': 'group_add',
    'social-share': 'ios_share'
  };
  
  // Add link to Material Icons if not already present
  if (!document.querySelector('link[href*="material-icons"]')) {
    const materialIconsLink = document.createElement('link');
    materialIconsLink.rel = 'stylesheet';
    materialIconsLink.href = 'https://fonts.googleapis.com/icon?family=Material+Icons';
    document.head.appendChild(materialIconsLink);
  }
  
  // Replace all Font Awesome icons with Material Design icons
  const elementItems = document.querySelectorAll('.element-item');
  elementItems.forEach(item => {
    const elementType = item.getAttribute('data-element-type');
    const iconName = iconMappings[elementType];
    
    if (iconName) {
      const iconElement = item.querySelector('i');
      if (iconElement) {
        // Remove Font Awesome classes
        iconElement.className = '';
        // Add Material Icons class
        iconElement.classList.add('material-icons');
        // Set icon text
        iconElement.textContent = iconName;
      }
    }
  });
  
  // Add custom styles for Material Icons
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    .icon-only-mode .element-item i.material-icons {
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  `;
  document.head.appendChild(styleElement);
  
  // CRITICAL FIX: Ensure all blocks use the same toolbar style as in the application
  function applyConsistentIconSet() {
    // Check if we have access to the proper function
    const hasAddDragHandles = typeof addDragHandles === 'function';
    
    // Process each email content block
    const emailBlocks = document.querySelectorAll('.email-content-block');
    emailBlocks.forEach(block => {
      // Check if block is missing the standard toolbar
      if (!block.querySelector('.block-toolbar') && !block.classList.contains('pending-icon-update')) {
        block.classList.add('pending-icon-update');
        
        // Use the proper function from email-builder-modern.js if available
        if (hasAddDragHandles) {
          addDragHandles(block);
        }
      }
    });
    
    // Remove any old-style buttons (orange/yellow)
    const yellowEditButtons = document.querySelectorAll(
      '.block-action-btn[style*="background: #FFD700"], ' + 
      '.block-action-btn[style*="background:#FFD700"]'
    );
    yellowEditButtons.forEach(btn => btn.remove());
    
    // Remove old color palette buttons
    const oldColorButtons = document.querySelectorAll(
      '.block-action-btn[style*="background: #999"], ' + 
      '.block-action-btn[style*="background:#999"]'
    );
    oldColorButtons.forEach(btn => btn.remove());
    
    // Remove old drag handles - they're replaced by the toolbar drag indicator
    const oldHandles = document.querySelectorAll('.block-handle');
    oldHandles.forEach(handle => handle.remove());
    
    // Clean up any empty action bars
    const emptyActionBars = document.querySelectorAll('.block-actions:empty');
    emptyActionBars.forEach(bar => bar.remove());
    
    // Remove any duplicate toolbars (ensure only one per block)
    emailBlocks.forEach(block => {
      const toolbars = block.querySelectorAll('.block-toolbar');
      if (toolbars.length > 1) {
        // Keep only the first toolbar
        for (let i = 1; i < toolbars.length; i++) {
          toolbars[i].remove();
        }
      }
    });
  }
  
  // Run immediately and ensure all blocks have consistent icon set
  applyConsistentIconSet();
  
  // Keep checking for new blocks that might need icons
  setTimeout(applyConsistentIconSet, 500);
  setTimeout(applyConsistentIconSet, 1000);
  setInterval(applyConsistentIconSet, 2000); // Continue checking every 2 seconds
  
  // Monitor for any dynamically added nodes and ensure consistent icons
  const observer = new MutationObserver(mutations => {
    let shouldCheck = false;
    
    mutations.forEach(mutation => {
      // Check for new nodes (could be blocks or elements)
      if (mutation.addedNodes && mutation.addedNodes.length) {
        for (let i = 0; i < mutation.addedNodes.length; i++) {
          const node = mutation.addedNodes[i];
          if (node.nodeType === 1) { // Element node
            if (
              // Need to check if there's a new email block or any inconsistent buttons
              node.classList && (
                node.classList.contains('email-content-block') ||
                node.classList.contains('block-action-btn') ||
                node.classList.contains('block-handle'))
            ) {
              shouldCheck = true;
              break;
            }
          }
        }
      }
      
      // Also check for attribute changes which might indicate styling changes
      if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
        shouldCheck = true;
      }
    });
    
    if (shouldCheck) {
      applyConsistentIconSet();
    }
  });
  
  // Start observing the email document
  const emailDocument = document.getElementById('email-document');
  if (emailDocument) {
    observer.observe(emailDocument, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style']
    });
  }
});
