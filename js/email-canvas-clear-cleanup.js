/**
 * Email Canvas Clear Button Cleanup
 * Removes any existing clear canvas button from the interface
 */

(function() {
  // Run cleanup immediately
  console.log('🧹 Running clear canvas button cleanup...');
  
  // Find and remove any existing clear canvas button
  const clearButton = document.getElementById('clear-canvas-btn');
  if (clearButton) {
    console.log('🗑️ Removing clear canvas button from interface');
    clearButton.remove();
  } else {
    console.log('ℹ️ No clear canvas button found to remove');
  }
  
  // Check for any other buttons with trash icons that might be the clear button
  const allButtons = document.querySelectorAll('button');
  allButtons.forEach(button => {
    if (button.querySelector('i.fa-trash-alt') || button.querySelector('i.fa-trash')) {
      console.log('🗑️ Removing alternative clear button from interface');
      button.remove();
    }
  });
  
  // Also remove any empty blocks that might have been added
  const emptyBlocks = document.querySelectorAll('.empty-block');
  emptyBlocks.forEach(block => {
    console.log('🗑️ Removing empty placeholder block');
    block.remove();
  });
  
  console.log('✅ Cleanup completed');
})();
