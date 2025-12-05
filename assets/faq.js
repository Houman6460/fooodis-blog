            const linkId = link.getAttribute('id') || `accordion-link-${Math.random().toString(36).substr(2, 9)}`;
            const contentId = `accordion-content-${linkId.split('-').pop()}`;
            
            // Set IDs if they don't exist
            if (!link.getAttribute('id')) {
                link.setAttribute('id', linkId);
            }
            content.setAttribute('id', contentId);
            
            // Set ARIA attributes for accessibility
            link.setAttribute('aria-controls', contentId);
            link.setAttribute('aria-expanded', link.classList.contains('active') ? 'true' : 'false');
            link.setAttribute('role', 'button');
            content.setAttribute('aria-labelledby', linkId);
            content.setAttribute('aria-hidden', link.classList.contains('active') ? 'false' : 'true');
            
            // Set initial display based on active class
            if (link.classList.contains('active')) {
                content.style.display = 'block';
            } else {
                content.style.display = 'none';
            }
            
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const isActive = this.classList.contains('active');
                
                // Close all items first
                closeAllItems();
                
                // If the clicked item wasn't active, open it
                if (!isActive) {
                    this.classList.add('active');
                    content.style.display = 'block';
                    content.classList.add('active');
                    
                    // Update ARIA attributes
                    this.setAttribute('aria-expanded', 'true');
                    content.setAttribute('aria-hidden', 'false');
                }
            });
        }
    });
    
    // Open the first accordion item by default if none are open
    const hasActiveItem = Array.from(accordionItems).some(item => 
        item.querySelector('.u-accordion-link.active')
    );
    
    if (!hasActiveItem && accordionItems.length > 0) {
        const firstLink = accordionItems[0].querySelector('.u-accordion-link');
        const firstContent = accordionItems[0].querySelector('.u-accordion-pane');
        
        if (firstLink && firstContent) {
            firstLink.classList.add('active');
            firstContent.style.display = 'block';
            firstContent.classList.add('active');
            firstLink.setAttribute('aria-expanded', 'true');
            firstContent.setAttribute('aria-hidden', 'false');
        }
    }
});
