// Consolidated script to fix all feature box images
// This script takes precedence over all other scripts

document.addEventListener('DOMContentLoaded', function() {
  console.log('Consolidated feature box fix script started');
  
  // Flag to prevent other scripts from making changes
  window.featureBoxesFixed = false;
  
  // Define the mapping of feature titles to their specific image paths
  const imageMapping = {
    'CREATE A DIGITAL MENU': 'images/Menu-2.png',
    'CREATE QR': 'images/ScreenShot2023-11-04at13.31copy.png',
    'POS AND PAYMENT SYSTEM': 'images/Payment-2.png',
    'ACCEPT LOCAL ORDERS': 'images/local.png',
    'ORDERING ON WHATSAPP': 'images/Whatsapp.png',
    'KITCHEN DISPLAY SYSTEM': 'images/imac-1.png', // Using the original image as requested
    'ORDER PREPARATION TIME': 'images/Time.png',
    'STAFF MANAGEMENT': 'images/staff.png',
    'LOYALTY PROGRAM': 'images/Loyal.png',
    'COUPONS': 'images/Coupon.png',
    'TIPS FEATURE': 'images/tips.png',
    'SOCIAL PROFILES': 'images/socialmedia2.png',
    'CUSTOMER LOG': 'images/customerlog.png',
    'ALLERGENS INFORMATION': 'images/Allergic.png',
    'THEME SWITCHER': 'images/Payment-2.png',
    'MULTILINGUAL MENUS': 'images/switch-2.png',
    'CUSTOM TIMEZONE SETTINGS': 'images/Timezoone.png',
    'IMPRESSUM DISPLAY': 'images/impersume.png',
    'AUTOMATED RECEIPT PRINTING': 'images/ScreenShot2023-11-5.png',
    'MENU AND SETTINGS CLONER': 'images/clone.png',
    'REAL-TIME WEBHOOKS': 'images/webhook.png',
    'CUSTOMIZABLE INTERFACE': 'images/costomiseweb-2.png',
    'CUSTOMER ACCOUNT MANAGEMENT': 'images/customer.png',
    'INVENTORY MANAGEMENT': 'images/inventory-1.png'
  };
  
  // Function to fix all feature boxes
  function fixAllFeatureBoxes() {
    // If already fixed, don't do anything
    if (window.featureBoxesFixed) {
      console.log('Feature boxes already fixed, skipping');
      return;
    }
    
    console.log('Fixing all feature boxes...');
    
    // Get all feature boxes
    const featureBoxes = document.querySelectorAll('.feature-box');
    console.log(`Found ${featureBoxes.length} feature boxes`);
    
    if (featureBoxes.length === 0) {
      console.error('No feature boxes found on the page');
      return;
    }
    
    // Create a map to track which titles we've already processed
    const processedTitles = {};
    
    // Process each feature box
    featureBoxes.forEach((box, index) => {
      try {
        // Find the title element
        const titleElement = box.querySelector('h2 span[data-lang-en]');
        if (!titleElement) {
          console.log(`Box ${index}: No title element found`);
          return;
        }
        
        // Get the title text
        const title = titleElement.getAttribute('data-lang-en');
        if (!title) {
          console.log(`Box ${index}: No title attribute found`);
          return;
        }
        
        // Find the background image div
        const bgDiv = box.querySelector('div[style*="background-image"]');
        if (!bgDiv) {
          console.log(`Box ${index}: No background image div found`);
          return;
        }
        
        // Check if we have a mapping for this title
        if (imageMapping[title]) {
          // Generate a unique ID for this box
          const uniqueId = `feature-box-${title.replace(/\\s+/g, '-').toLowerCase()}-${index}`;
          box.id = uniqueId;
          
          // Get the correct image path
          const imagePath = imageMapping[title];
          
          // Store the original image path for reference
          const originalImagePath = bgDiv.style.backgroundImage;
          box.setAttribute('data-original-image', originalImagePath);
          
          // Update the background image
          bgDiv.style.backgroundImage = `url('${imagePath}')`;
          
          // Add data attributes for debugging
          box.setAttribute('data-fixed', 'true');
          box.setAttribute('data-title', title);
          box.setAttribute('data-image', imagePath);
          
          console.log(`Box ${index}: Updated "${title}" with image ${imagePath}`);
          
          // Track this title instance
          if (!processedTitles[title]) {
            processedTitles[title] = [];
          }
          processedTitles[title].push(index);
        } else {
          console.log(`Box ${index}: No image mapping found for title "${title}"`);
        }
      } catch (error) {
        console.error(`Error processing box ${index}:`, error);
      }
    });
    
    // Log summary of processed titles
    console.log('Processed titles summary:', processedTitles);
    
    // Mark as fixed to prevent other scripts from making changes
    window.featureBoxesFixed = true;
    
    // Override any existing updateFeatureBoxImage functions
    window.updateFeatureBoxImage = function(boxId, imagePath) {
      console.log(`Manual update requested for box ${boxId} with image ${imagePath}`);
      const box = document.getElementById(boxId);
      if (!box) {
        console.error(`Box with ID ${boxId} not found`);
        return false;
      }
      
      const bgDiv = box.querySelector('div[style*="background-image"]');
      if (!bgDiv) {
        console.error(`No background image div found in box ${boxId}`);
        return false;
      }
      
      bgDiv.style.backgroundImage = `url('${imagePath}')`;
      box.setAttribute('data-image', imagePath);
      console.log(`Manually updated box ${boxId} with image ${imagePath}`);
      return true;
    };
    
    // Prevent other scripts from changing the images
    const originalSetAttribute = Element.prototype.setAttribute;
    Element.prototype.setAttribute = function(name, value) {
      // If this is a feature box and we're trying to change its background image, block it
      if (this.classList && this.classList.contains('feature-box') && 
          (name === 'style' || name === 'data-image' || name === 'data-image-path') && 
          window.featureBoxesFixed) {
        console.log('Blocked attempt to modify feature box attribute:', name, value);
        return;
      }
      
      // Allow all other setAttribute calls
      return originalSetAttribute.call(this, name, value);
    };
    
    // Also override style.backgroundImage for divs inside feature boxes
    const featureBoxDivs = document.querySelectorAll('.feature-box div');
    featureBoxDivs.forEach(div => {
      const originalStyleDescriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'style');
      const originalBackgroundImageDescriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, 'backgroundImage');
      
      if (originalBackgroundImageDescriptor && originalBackgroundImageDescriptor.set) {
        const originalSetter = originalBackgroundImageDescriptor.set;
        
        Object.defineProperty(div.style, 'backgroundImage', {
          set: function(value) {
            // If this div is inside a feature box and we've already fixed the boxes, block changes
            if (div.closest('.feature-box') && window.featureBoxesFixed) {
              console.log('Blocked attempt to modify background image:', value);
              return;
            }
            
            // Allow the original setter to work
            return originalSetter.call(this, value);
          },
          get: originalBackgroundImageDescriptor.get
        });
      }
    });
    
    console.log('Feature box fix complete and locked');
  }
  
  // Run immediately if DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    fixAllFeatureBoxes();
  } else {
    // Otherwise wait for DOM to be ready
    window.addEventListener('DOMContentLoaded', fixAllFeatureBoxes);
  }
  
  // Also run after a short delay to ensure all elements are rendered
  setTimeout(fixAllFeatureBoxes, 100);
  
  // And run one more time after a longer delay to catch any late changes
  setTimeout(fixAllFeatureBoxes, 500);
  
  // Disable the other scripts
  if (window.disconnectFeatureBoxes) {
    console.log('Disabling disconnect-feature-boxes.js');
    window.disconnectFeatureBoxes = function() {
      console.log('disconnect-feature-boxes.js disabled');
    };
  }
  
  console.log('Consolidated feature box fix script initialization complete');
});
