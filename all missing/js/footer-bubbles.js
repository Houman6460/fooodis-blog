/**
 * Fooodis Footer Bubble Animation
 * Creates and animates bubbles in the footer for a dynamic visual effect
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the bubble animation when the DOM is loaded
    initBubbleAnimation();
});

/**
 * Initialize the bubble animation in the footer
 */
function initBubbleAnimation() {
    const bubblesContainer = document.querySelector('.bubbles');
    
    // If there's no bubbles container, exit
    if (!bubblesContainer) return;
    
    // Clear any existing bubbles
    bubblesContainer.innerHTML = '';
    
    // Create 15 bubbles
    for (let i = 0; i < 15; i++) {
        createBubble(bubblesContainer);
    }
}

/**
 * Create a single bubble element and add it to the container
 * @param {HTMLElement} container - The container to add the bubble to
 */
function createBubble(container) {
    // Create a bubble element
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    
    // Random size between 30px and 120px
    const size = Math.random() * 90 + 30;
    bubble.style.width = `${size}px`;
    bubble.style.height = `${size}px`;
    
    // Random horizontal position
    const left = Math.random() * 100;
    bubble.style.left = `${left}%`;
    
    // Random start position (bottom of container)
    const bottom = -10 - Math.random() * 20;
    bubble.style.bottom = `${bottom}%`;
    
    // Random animation duration between 6 and 12 seconds
    const duration = Math.random() * 6 + 6;
    bubble.style.animationDuration = `${duration}s`;
    
    // Random delay so bubbles don't all start at once
    const delay = Math.random() * 5;
    bubble.style.animationDelay = `${delay}s`;
    
    // Add bubble to container
    container.appendChild(bubble);
    
    // Remove and recreate bubble when animation ends
    bubble.addEventListener('animationend', function() {
        bubble.remove();
        createBubble(container);
    });
}
