/**
 * Email Block Position Controls
 * Adds direct up/down buttons to each block for easy, one-step repositioning
 */

(function() {
  // Use a unique prefix for console logs
  var PREFIX = '[BlockPositionControls]';
  console.log(PREFIX, 'Initializing block position controls');
  
  // Add direct CSS styles for the controls
  function addStyles() {
    var styleId = 'block-position-controls-style';
    if (document.getElementById(styleId)) return;
    
    var style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .block-position-controls {
        position: absolute;
        top: 5px;
        right: 5px;
        display: flex;
        gap: 4px;
        z-index: 9999;
        background: rgba(255,255,255,0.8);
        border-radius: 4px;
        padding: 2px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      }
      
      .block-move-btn {
        width: 28px;
        height: 28px;
        border: none;
        border-radius: 4px;
        background: #4a90e2;
        color: white;
        font-size: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      
      .block-move-btn:hover {
        background: #3a80d2;
      }
      
      .email-content-block {
        position: relative;
      }
    `;
    document.head.appendChild(style);
    console.log(PREFIX, 'Added position control styles');
  }
  
  // Move a block up one position
  function moveBlockUp(block) {
    if (!block) return;
    
    var container = document.getElementById('email-document');
    if (!container) return;
    
    var prevBlock = block.previousElementSibling;
    if (prevBlock && prevBlock.classList.contains('email-content-block')) {
      container.insertBefore(block, prevBlock);
      console.log(PREFIX, 'Moved block up ONE position');
    }
  }
  
  // Move a block down one position
  function moveBlockDown(block) {
    if (!block) return;
    
    var container = document.getElementById('email-document');
    if (!container) return;
    
    var nextBlock = block.nextElementSibling;
    if (nextBlock && nextBlock.classList.contains('email-content-block')) {
      var afterNext = nextBlock.nextElementSibling;
      if (afterNext) {
        container.insertBefore(block, afterNext);
      } else {
        container.appendChild(block);
      }
      console.log(PREFIX, 'Moved block down ONE position');
    }
  }
  
  // Add position controls to a block
  function addPositionControls(block) {
    if (!block || block.querySelector('.block-position-controls')) return;
    
    var controls = document.createElement('div');
    controls.className = 'block-position-controls';
    
    var upBtn = document.createElement('button');
    upBtn.className = 'block-move-btn block-move-up';
    upBtn.innerHTML = '&#8593;'; // Up arrow
    upBtn.title = 'Move Block Up';
    upBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      moveBlockUp(block);
      return false;
    };
    
    var downBtn = document.createElement('button');
    downBtn.className = 'block-move-btn block-move-down';
    downBtn.innerHTML = '&#8595;'; // Down arrow
    downBtn.title = 'Move Block Down';
    downBtn.onclick = function(e) {
      e.preventDefault();
      e.stopPropagation();
      moveBlockDown(block);
      return false;
    };
    
    controls.appendChild(upBtn);
    controls.appendChild(downBtn);
    block.appendChild(controls);
    
    console.log(PREFIX, 'Added position controls to block');
  }
  
  // Enhance all existing blocks
  function enhanceExistingBlocks() {
    var blocks = document.querySelectorAll('.email-content-block');
    console.log(PREFIX, 'Found', blocks.length, 'existing blocks');
    
    blocks.forEach(function(block) {
      addPositionControls(block);
    });
  }
  
  // Setup mutation observer to catch new blocks
  function setupObserver() {
    var observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes && mutation.addedNodes.length > 0) {
          for (var i = 0; i < mutation.addedNodes.length; i++) {
            var node = mutation.addedNodes[i];
            if (node.classList && node.classList.contains('email-content-block')) {
              addPositionControls(node);
            }
          }
        }
      });
    });
    
    var container = document.getElementById('email-document');
    if (container) {
      observer.observe(container, { childList: true, subtree: true });
      console.log(PREFIX, 'Started observer for new blocks');
    }
  }
  
  // Initialize the controls
  function init() {
    console.log(PREFIX, 'Initializing');
    addStyles();
    enhanceExistingBlocks();
    setupObserver();
    
    // Also check after a delay for any dynamically added blocks
    setTimeout(enhanceExistingBlocks, 1000);
    setTimeout(enhanceExistingBlocks, 2000);
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also run on window load to catch late-loaded elements
  window.addEventListener('load', function() {
    setTimeout(enhanceExistingBlocks, 500);
  });
  
})();
