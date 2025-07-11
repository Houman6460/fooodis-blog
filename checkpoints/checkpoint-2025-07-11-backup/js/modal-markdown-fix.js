/**
 * Modal Markdown Fix
 * Directly enforces markdown rendering in blog post popups
 */

// Execute as soon as DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Modal Markdown Fix: Initializing...');
    
    // Apply fix on page load
    applyModalFix();
    
    // Also apply when window loads
    window.addEventListener('load', function() {
        applyModalFix();
        // Apply again after a delay to catch any late initializations
        setTimeout(applyModalFix, 1000);
    });
    
    // Set up the mutation observer to catch dynamic changes
    setupModalObserver();
});

/**
 * Apply the modal fix
 */
function applyModalFix() {
    console.log('Modal Markdown Fix: Applying fix');
    
    // Override the openBlogPostModal function to directly apply markdown rendering
    if (typeof window.openBlogPostModal === 'function') {
        console.log('Modal Markdown Fix: Found openBlogPostModal function, overriding it');
        
        // Store the original function
        const originalOpenModal = window.openBlogPostModal;
        
        // Replace with our modified version
        window.openBlogPostModal = function(postId) {
            console.log('Modal Markdown Fix: Handling post display for', postId);
            
            // Call the original function first
            originalOpenModal(postId);
            
            // Now enhance the modal content with markdown
            setTimeout(function() {
                const modalContentText = document.querySelector('.modal-content-text');
                
                if (modalContentText) {
                    // Find the post data
                    const posts = JSON.parse(localStorage.getItem('fooodis-blog-posts') || '[]');
                    const post = posts.find(p => p.id === postId);
                    
                    if (post && post.content) {
                        console.log('Modal Markdown Fix: Found post content, applying markdown rendering');
                        
                        // Apply markdown rendering if the function exists
                        if (typeof window.renderMarkdown === 'function') {
                            console.log('Modal Markdown Fix: Using renderMarkdown function');
                            modalContentText.innerHTML = window.renderMarkdown(post.content);
                        } else {
                            // Direct HTML modification as a fallback
                            console.log('Modal Markdown Fix: Using fallback markdown formatting');
                            modalContentText.innerHTML = applyBasicMarkdown(post.content);
                        }
                        
                        // Ensure correct styling
                        modalContentText.style.color = '#fff';
                        
                        // Apply additional styling to markdown content
                        const markdownElements = modalContentText.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, li, blockquote, table, pre, code');
                        markdownElements.forEach(element => {
                            element.style.color = '#fff';
                        });
                    }
                }
            }, 100);
        };
    }
    
    console.log('Modal Markdown Fix: Fix applied');
}

/**
 * Set up mutation observer to catch when modal content is added dynamically
 */
function setupModalObserver() {
    console.log('Modal Markdown Fix: Setting up mutation observer');
    
    // Create a new observer
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            // Check if the modal body was modified
            if (mutation.type === 'childList' && 
                (mutation.target.classList.contains('modal-body') ||
                 mutation.target.classList.contains('modal-content-text'))) {
                
                console.log('Modal Markdown Fix: Detected change in modal content');
                
                // Process any content that might need markdown
                processModalContent();
            }
        });
    });
    
    // Wait for modal to be available
    const checkForModal = setInterval(function() {
        const modalBody = document.querySelector('.modal-body');
        if (modalBody) {
            clearInterval(checkForModal);
            
            // Start observing the modal body
            observer.observe(modalBody, { 
                childList: true, 
                subtree: true 
            });
            
            console.log('Modal Markdown Fix: Observer attached to modal');
        }
    }, 500);
}

/**
 * Process modal content to apply markdown
 */
function processModalContent() {
    console.log('Modal Markdown Fix: Processing modal content');
    
    const modalContentText = document.querySelector('.modal-content-text');
    
    if (modalContentText && !modalContentText.dataset.markdownProcessed) {
        // Get the text content
        const content = modalContentText.textContent || modalContentText.innerText;
        
        if (content && 
            (content.includes('#') || content.includes('*') || 
             content.includes('|') || content.includes('-'))) {
            
            console.log('Modal Markdown Fix: Applying markdown to modal content');
            
            // Apply markdown rendering if the function exists
            if (typeof window.renderMarkdown === 'function') {
                modalContentText.innerHTML = window.renderMarkdown(content);
            } else {
                // Direct HTML modification as a fallback
                modalContentText.innerHTML = applyBasicMarkdown(content);
            }
            
            // Mark as processed
            modalContentText.dataset.markdownProcessed = 'true';
            
            // Ensure correct styling
            modalContentText.style.color = '#fff';
            
            // Apply additional styling to markdown content
            const markdownElements = modalContentText.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, li, blockquote, table, pre, code');
            markdownElements.forEach(element => {
                element.style.color = '#fff';
            });
        }
    }
}

/**
 * Apply basic markdown rendering as a fallback
 * @param {string} text - The text to format
 * @returns {string} - HTML formatted content
 */
function applyBasicMarkdown(text) {
    if (!text) return '';
    
    let html = text;
    
    // Process headers
    html = html
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
        .replace(/^##### (.*$)/gm, '<h5>$1</h5>')
        .replace(/^###### (.*$)/gm, '<h6>$1</h6>');
    
    // Process emphasis (bold, italic)
    html = html
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/__(.*?)__/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Process lists
    html = html
        .replace(/^\* (.*$)/gm, '<li>$1</li>')
        .replace(/^- (.*$)/gm, '<li>$1</li>')
        .replace(/^\+ (.*$)/gm, '<li>$1</li>');
    
    // Wrap lists in <ul> tags
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
    
    // Fix nested <ul> tags
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    
    // Process blockquotes
    html = html.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Fix nested blockquotes
    html = html.replace(/<\/blockquote>\s*<blockquote>/g, '<br>');
    
    // Simple table handling (basic support)
    if (html.includes('|')) {
        const tableLines = html.split('\n').filter(line => line.includes('|'));
        if (tableLines.length > 2) {
            // Start with table HTML
            let tableHtml = '<table class="markdown-table">';
            
            // Process the first line as header
            const headerCells = tableLines[0].split('|')
                .filter(cell => cell.trim() !== '')
                .map(cell => `<th>${cell.trim()}</th>`);
            
            tableHtml += `<tr>${headerCells.join('')}</tr>`;
            
            // Skip the second line (separator)
            
            // Process remaining lines as data rows
            for (let i = 2; i < tableLines.length; i++) {
                const rowCells = tableLines[i].split('|')
                    .filter(cell => cell.trim() !== '')
                    .map(cell => `<td>${cell.trim()}</td>`);
                
                tableHtml += `<tr>${rowCells.join('')}</tr>`;
            }
            
            // Close the table
            tableHtml += '</table>';
            
            // Replace the table text with the HTML
            html = html.replace(tableLines.join('\n'), tableHtml);
        }
    }
    
    // Process paragraphs (lines that don't start with HTML tags)
    html = html.replace(/^(?!<[a-z])(.*$)/gm, '<p>$1</p>');
    
    // Fix empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    
    // Wrap in container div
    html = `<div class="markdown-content">${html}</div>`;
    
    return html;
}

// Add direct style to ensure the modal content is properly formatted
const style = document.createElement('style');
style.textContent = `
    .modal-content-text {
        color: #fff !important;
    }
    
    .modal-content-text h1,
    .modal-content-text h2,
    .modal-content-text h3,
    .modal-content-text h4,
    .modal-content-text h5,
    .modal-content-text h6,
    .modal-content-text p,
    .modal-content-text ul,
    .modal-content-text ol,
    .modal-content-text li,
    .modal-content-text blockquote,
    .modal-content-text table,
    .modal-content-text th,
    .modal-content-text td,
    .modal-content-text pre,
    .modal-content-text code {
        color: #fff !important;
    }
    
    .modal-content {
        background-color: #1a1a1a !important;
    }
    
    .markdown-table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 1em;
    }
    
    .markdown-table th, 
    .markdown-table td {
        padding: 8px;
        text-align: left;
        border: 1px solid #444;
        color: #fff !important;
    }
    
    .markdown-table th {
        background-color: #333 !important;
        font-weight: bold;
    }
    
    .markdown-table tr:nth-child(even) {
        background-color: #2a2a2a !important;
    }
`;
document.head.appendChild(style);
