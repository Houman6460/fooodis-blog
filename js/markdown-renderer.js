/**
 * Markdown Renderer
 * Converts markdown in blog posts to properly formatted HTML
 */

(function() {
    console.log('Markdown Renderer: Initializing...');
    
    // Apply immediately and on window load
    document.addEventListener('DOMContentLoaded', initMarkdownRenderer);
    window.addEventListener('load', function() {
        initMarkdownRenderer();
        setTimeout(initMarkdownRenderer, 1000);
    });
})();

/**
 * Initialize markdown rendering
 */
function initMarkdownRenderer() {
    console.log('Markdown Renderer: Setting up...');
    
    // Add the renderMarkdown function to the window
    window.renderMarkdown = function(markdown) {
        if (!markdown) return '';
        
        try {
            // Clean up newlines for consistent processing
            let text = markdown.replace(/\r\n/g, '\n');
            
            // Extract and temporarily replace code blocks and inline code
            const codeBlocks = [];
            const inlineCode = [];
            
            // Handle code blocks (```)
            text = text.replace(/```([\s\S]*?)```/g, function(match, code) {
                const id = codeBlocks.length;
                codeBlocks.push(code);
                return `__CODE_BLOCK_${id}__`;
            });
            
            // Handle inline code (`)
            text = text.replace(/`([^`]+)`/g, function(match, code) {
                const id = inlineCode.length;
                inlineCode.push(code);
                return `__INLINE_CODE_${id}__`;
            });
            
            // Process headers with proper markdown formatting
            let html = text
                // Handle headers with # syntax
                .replace(/^(#{1,6})\s+(.+)$/gm, function(match, hashes, content) {
                    const level = hashes.length;
                    return `<h${level}>${content.trim()}</h${level}>`;
                })
                // Handle headers with === and --- underlines
                .replace(/^([^\n]+)\n={3,}\n/gm, '<h1>$1</h1>')
                .replace(/^([^\n]+)\n-{3,}\n/gm, '<h2>$1</h2>');
            
            // Process bold and italic text
            html = html
                // Bold with ** or __
                .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                .replace(/__([^_]+)__/g, '<strong>$1</strong>')
                // Italic with * or _
                .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                .replace(/_([^_]+)_/g, '<em>$1</em>');
            
            // Process horizontal rules
            html = html.replace(/^([-*_]){3,}$/gm, '<hr>');
            
            // Process blockquotes
            // First identify all blockquote sections
            const blockquoteSections = html.match(/((^>.*\n)+)/gm);
            if (blockquoteSections) {
                for (const section of blockquoteSections) {
                    // Process each line
                    const processed = section
                        .replace(/^>\s?(.*)$/gm, '$1')  // Remove > prefix
                        .trim();                         // Trim whitespace
                    
                    // Replace in original html
                    html = html.replace(section, `<blockquote>${processed}</blockquote>`);
                }
            }
            
            // Process ordered and unordered lists with nesting support
            // First identify all list sections (consecutive list items)
            const listSections = html.match(/((^[\s]*[*\-+]\s+.+\n)+|((^[\s]*\d+\.\s+.+\n)+))/gm);
            
            if (listSections) {
                for (const section of listSections) {
                    let processed = '';
                    const isOrdered = /^\d+\./.test(section.trim());
                    
                    // Determine if we're dealing with an ordered or unordered list
                    const listTag = isOrdered ? 'ol' : 'ul';
                    
                    // Process each line
                    processed = `<${listTag}>\n` + 
                        section
                            .replace(/^[\s]*([*\-+]|\d+\.)\s+(.*)$/gm, '<li>$2</li>')
                            .trim() + 
                        `\n</${listTag}>`;
                    
                    // Replace in original html
                    html = html.replace(section, processed);
                }
            }
            
            // Process tables - this needs to be much more robust than before
            // Identify all table sections (header, separator, rows)
            const tableSections = html.match(/^\|(.+)\|\s*\n\|\s*[-:]+[-\s|:]*[-:]\s*\|\s*\n(\|.+\|\s*\n)+/gm);
            
            if (tableSections) {
                for (const section of tableSections) {
                    const rows = section.trim().split('\n');
                    
                    // Start the table
                    let tableHtml = '<table class="markdown-table">';
                    
                    // Process header row
                    if (rows[0].startsWith('|')) {
                        const headerCells = rows[0]
                            .split('|')
                            .filter((cell, i, arr) => i > 0 && i < arr.length - 1 || (cell.trim() !== '' && (i === 0 || i === arr.length - 1)))
                            .map(cell => `<th>${cell.trim()}</th>`);
                        
                        tableHtml += `<tr>${headerCells.join('')}</tr>`;
                    }
                    
                    // Skip the separator row
                    
                    // Process data rows (starting from row 2)
                    for (let i = 2; i < rows.length; i++) {
                        if (rows[i].startsWith('|')) {
                            const rowCells = rows[i]
                                .split('|')
                                .filter((cell, i, arr) => i > 0 && i < arr.length - 1 || (cell.trim() !== '' && (i === 0 || i === arr.length - 1)))
                                .map(cell => `<td>${cell.trim()}</td>`);
                            
                            tableHtml += `<tr>${rowCells.join('')}</tr>`;
                        }
                    }
                    
                    // Close the table
                    tableHtml += '</table>';
                    
                    // Replace in original html
                    html = html.replace(section, tableHtml);
                }
            }
            
            // Process basic links
            html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
            
            // Process image links
            html = html.replace(/!\[([^\]]+)\]\(([^\)]+)\)/g, '<img src="$2" alt="$1">');
            
            // Now process any remaining text into paragraphs
            // We need to handle raw text blocks that aren't part of any other element
            const paragraphBlocks = html.split(/\n{2,}/);
            
            html = paragraphBlocks.map(block => {
                // Skip blocks that are already wrapped in HTML tags
                if (block.trim() === '' || 
                    block.trim().startsWith('<') || 
                    block.trim() === '__CODE_BLOCK' || 
                    block.trim().startsWith('__INLINE_CODE')) {
                    return block;
                }
                
                // Wrap plain text in paragraph tags
                return `<p>${block.trim()}</p>`;
            }).join('\n\n');
            
            // Restore code blocks
            codeBlocks.forEach((code, i) => {
                const placeholder = `__CODE_BLOCK_${i}__`;
                const formattedCode = `<pre><code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
                html = html.replace(placeholder, formattedCode);
            });
            
            // Restore inline code
            inlineCode.forEach((code, i) => {
                const placeholder = `__INLINE_CODE_${i}__`;
                const formattedCode = `<code>${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>`;
                html = html.replace(placeholder, formattedCode);
            });
            
            // Fix any extra line breaks and spacing issues caused by our processing
            html = html
                // Clean up multiple breaks
                .replace(/<br>\s*<br>\s*<br>/g, '<br><br>')
                // Clean up breaks before closing tags
                .replace(/<br>\s*<\/(p|li|h\d|blockquote)>/g, '</$1>')
                // Clean up breaks after opening tags
                .replace(/<(p|li|h\d|blockquote)>\s*<br>/g, '<$1>');
            
            // Add outer wrapper with styling class
            html = `<div class="markdown-content">${html}</div>`;
            
            return html;
        } catch (error) {
            console.error('Markdown Renderer: Error rendering markdown', error);
            return markdown; // Return the original markdown if there's an error
        }
    };
    
    // Hook into the blog rendering process
    hookIntoBlogRendering();
    
    console.log('Markdown Renderer: Setup complete');
}

/**
 * Hook into the blog rendering process
 */
function hookIntoBlogRendering() {
    // Check if we're on the blog page
    const isBlogPage = window.location.href.includes('blog.html');
    
    if (isBlogPage) {
        console.log('Markdown Renderer: Detected blog page, hooking into rendering');
        
        // Override the renderBlogPosts function if it exists
        if (typeof window.renderBlogPosts === 'function') {
            console.log('Markdown Renderer: Found renderBlogPosts function, overriding it');
            
            const originalRenderBlogPosts = window.renderBlogPosts;
            
            window.renderBlogPosts = function(customPosts) {
                console.log('Markdown Renderer: Rendering blog posts with markdown support');
                
                // Get the posts - either from parameter or from localStorage
                let posts = customPosts;
                if (!posts) {
                    try {
                        const storedPosts = localStorage.getItem('fooodis-blog-posts');
                        if (storedPosts) {
                            posts = JSON.parse(storedPosts);
                        }
                    } catch (error) {
                        console.error('Markdown Renderer: Error getting posts from localStorage', error);
                    }
                }
                
                // Process markdown in all posts
                if (Array.isArray(posts)) {
                    posts = posts.map(post => {
                        if (post && post.content) {
                            // Check if content appears to be markdown
                            if (post.content.includes('#') || 
                                post.content.includes('*') || 
                                post.content.includes('|') ||
                                post.content.includes('-')) {
                                
                                console.log('Markdown Renderer: Processing markdown in post:', post.title);
                                post.renderedContent = window.renderMarkdown(post.content);
                            }
                        }
                        return post;
                    });
                }
                
                // Call the original function with the processed posts
                return originalRenderBlogPosts(posts);
            };
        }
        
        // Also hook into the displayPost function if it exists
        if (typeof window.displayPost === 'function') {
            console.log('Markdown Renderer: Found displayPost function, overriding it');
            
            const originalDisplayPost = window.displayPost;
            
            window.displayPost = function(postId) {
                console.log('Markdown Renderer: Displaying post with markdown support');
                
                // Get the post from localStorage
                try {
                    const storedPosts = localStorage.getItem('fooodis-blog-posts');
                    if (storedPosts) {
                        const posts = JSON.parse(storedPosts);
                        const post = posts.find(p => p.id === postId);
                        
                        if (post && post.content) {
                            // Render markdown
                            post.renderedContent = window.renderMarkdown(post.content);
                            
                            // Save the modified post back to localStorage
                            localStorage.setItem('fooodis-blog-posts', JSON.stringify(posts));
                        }
                    }
                } catch (error) {
                    console.error('Markdown Renderer: Error processing post for display', error);
                }
                
                // Call the original function
                return originalDisplayPost(postId);
            };
        }
        
        // Add CSS for markdown rendering
        addMarkdownStyles();
    }
}

/**
 * Add CSS styles for markdown rendering
 */
function addMarkdownStyles() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .markdown-content {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        
        .markdown-content h1 {
            font-size: 2.2em;
            margin-bottom: 0.7em;
            color: #1a1a1a;
            border-bottom: 1px solid #eee;
            padding-bottom: 0.3em;
        }
        
        .markdown-content h2 {
            font-size: 1.8em;
            margin-top: 1.5em;
            margin-bottom: 0.6em;
            color: #1a1a1a;
        }
        
        .markdown-content h3 {
            font-size: 1.5em;
            margin-top: 1.3em;
            margin-bottom: 0.5em;
            color: #333;
        }
        
        .markdown-content h4 {
            font-size: 1.3em;
            margin-top: 1.2em;
            margin-bottom: 0.5em;
            color: #444;
        }
        
        .markdown-content h5 {
            font-size: 1.1em;
            margin-top: 1.1em;
            margin-bottom: 0.5em;
            color: #555;
        }
        
        .markdown-content h6 {
            font-size: 1em;
            margin-top: 1em;
            margin-bottom: 0.5em;
            color: #666;
        }
        
        .markdown-content p {
            margin-bottom: 1em;
        }
        
        .markdown-content a {
            color: #0366d6;
            text-decoration: none;
        }
        
        .markdown-content a:hover {
            text-decoration: underline;
        }
        
        .markdown-content ul {
            margin-bottom: 1em;
            padding-left: 2em;
        }
        
        .markdown-content li {
            margin-bottom: 0.3em;
        }
        
        .markdown-content blockquote {
            padding: 0.5em 1em;
            margin-bottom: 1em;
            border-left: 4px solid #ddd;
            color: #666;
            background-color: #f9f9f9;
        }
        
        .markdown-content code {
            font-family: Consolas, Monaco, 'Andale Mono', monospace;
            background-color: #f6f8fa;
            padding: 0.2em 0.4em;
            border-radius: 3px;
        }
        
        .markdown-content pre {
            background-color: #f6f8fa;
            padding: 1em;
            border-radius: 3px;
            overflow-x: auto;
            margin-bottom: 1em;
        }
        
        .markdown-content hr {
            height: 1px;
            background-color: #ddd;
            border: none;
            margin: 2em 0;
        }
        
        .markdown-table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 1em;
        }
        
        .markdown-table th, .markdown-table td {
            padding: 8px;
            text-align: left;
            border: 1px solid #ddd;
        }
        
        .markdown-table th {
            background-color: #f6f8fa;
            font-weight: bold;
        }
        
        .markdown-table tr:nth-child(even) {
            background-color: #f9f9f9;
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Direct hook for blog.js - ONLY for modal content, NOT blog cards
document.addEventListener('DOMContentLoaded', function() {
    // Direct DOM manipulation for full post content ONLY (not card previews)
    setInterval(function() {
        // Only process modal content text, NOT blog card content
        const modalContentText = document.querySelectorAll('.modal-content-text');
        if (modalContentText.length > 0) {
            modalContentText.forEach(postContent => {
                // Check if this post has already been processed
                if (!postContent.dataset.markdownProcessed) {
                    const originalText = postContent.textContent || postContent.innerText;
                    
                    // Only process if it looks like markdown
                    if (originalText.includes('#') || 
                        originalText.includes('*') || 
                        originalText.includes('|') ||
                        originalText.includes('-')) {
                        
                        // Render the markdown
                        postContent.innerHTML = window.renderMarkdown(originalText);
                        
                        // Mark as processed
                        postContent.dataset.markdownProcessed = 'true';
                        console.log('Markdown Renderer: Processed modal content via DOM');
                    }
                }
            });
        }
        
        // Also look for full blog post views
        const fullPostContent = document.querySelector('.full-post-content');
        if (fullPostContent && !fullPostContent.dataset.markdownProcessed) {
            const originalText = fullPostContent.textContent || fullPostContent.innerText;
            
            // Only process if it looks like markdown
            if (originalText.includes('#') || 
                originalText.includes('*') || 
                originalText.includes('|') ||
                originalText.includes('-')) {
                
                // Render the markdown
                fullPostContent.innerHTML = window.renderMarkdown(originalText);
                
                // Mark as processed
                fullPostContent.dataset.markdownProcessed = 'true';
                console.log('Markdown Renderer: Processed full post content via DOM');
            }
        }
    }, 1000); // Check every second
});
