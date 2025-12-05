const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configure paths
const rootDir = path.resolve(__dirname, '..');
const cssOutputPath = path.join(rootDir, 'assets', 'auto-generated-styles.css');
const cssLinkPath = '/assets/auto-generated-styles.css'; // Path for the link element

// Track stats
let stats = {
    filesProcessed: 0,
    linksFixed: 0,
    imagesFixed: 0,
    ariaFixed: 0,
    inlineStylesRemoved: 0,
    cssRulesAdded: 0
};

// Store extracted CSS
let extractedCSS = '/* Auto-generated styles from inline CSS - ' + new Date().toISOString() + ' */\n\n';
let cssClassCounter = 0;

// Process all HTML files
function processAllFiles() {
    console.log('Starting to fix all HTML issues...');
    
    // Get all HTML files recursively
    const htmlFiles = findAllHtmlFiles(rootDir);
    
    console.log(`Found ${htmlFiles.length} HTML files to process`);
    
    // Process each file
    htmlFiles.forEach(file => {
        processFile(file);
    });
    
    // Write all extracted CSS to file
    fs.writeFileSync(cssOutputPath, extractedCSS);
    
    console.log('\nCompleted processing all files:');
    console.log(`- Files processed: ${stats.filesProcessed}`);
    console.log(`- Links fixed: ${stats.linksFixed}`);
    console.log(`- Images fixed: ${stats.imagesFixed}`);
    console.log(`- ARIA issues fixed: ${stats.ariaFixed}`);
    console.log(`- Inline styles removed: ${stats.inlineStylesRemoved}`);
    console.log(`- CSS rules added: ${stats.cssRulesAdded}`);
    console.log(`\nExtracted CSS saved to: ${cssOutputPath}`);
}

// Find all HTML files recursively
function findAllHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat && stat.isDirectory() && file !== 'node_modules') {
            // Recurse into subdirectories
            results = results.concat(findAllHtmlFiles(filePath));
        } else if (path.extname(file).toLowerCase() === '.html') {
            // Add HTML files
            results.push(filePath);
        }
    });
    
    return results;
}

// Get relative path for CSS link
function getRelativePath(filePath) {
    const relDir = path.relative(path.dirname(filePath), rootDir);
    return relDir ? path.join(relDir, 'assets/auto-generated-styles.css').replace(/\\/g, '/') : 'assets/auto-generated-styles.css';
}

// Process a single file
function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    try {
        // Read file
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        let modified = false;
        
        // 1. Fix external links - add rel="noopener noreferrer"
        const externalLinks = $('a[href^="http"], a[href^="https"], a[target="_blank"]');
        externalLinks.each((i, link) => {
            const $link = $(link);
            if (!$link.attr('rel') || !$link.attr('rel').includes('noopener')) {
                $link.attr('rel', 'noopener noreferrer');
                stats.linksFixed++;
                modified = true;
            }
        });
        
        // 2. Fix images - add missing alt/title attributes
        const images = $('img:not([alt]), img[tabindex]:not([title])');
        images.each((i, img) => {
            const $img = $(img);
            const src = $img.attr('src') || '';
            const filename = path.basename(src).split('.')[0] || 'image';
            
            // Generate a descriptive alt text based on available attributes or filename
            let altText = $img.attr('alt') || 
                        $img.attr('data-caption') || 
                        $img.parent('a').text().trim() || 
                        filename.replace(/[-_]/g, ' ');
            
            if (!$img.attr('alt')) {
                $img.attr('alt', altText);
                modified = true;
            }
            
            if (!$img.attr('title') && $img.attr('tabindex')) {
                $img.attr('title', altText);
                modified = true;
            }
            
            stats.imagesFixed++;
        });
        
        // 3. Fix ARIA roles
        $('[role="tab"], [role="tablist"], [role="tabpanel"]').each((i, el) => {
            const $el = $(el);
            
            // For tabs with incorrect children structure
            if ($el.is('[role="tab"]')) {
                // Ensure proper structure - if img or other elements don't have proper accessibility
                $el.find('img:not([title])').attr('title', 'Tab image');
                $el.find('h3[tabindex]').attr('aria-label', function() {
                    return $(this).text().trim();
                });
                
                // If missing accessible name
                if (!$el.attr('aria-label') && !$el.attr('aria-labelledby')) {
                    const text = $el.text().trim();
                    if (text) {
                        $el.attr('aria-label', text);
                    }
                }
            } else if ($el.is('[role="tablist"]')) {
                // Fix tablist structure issues
                $el.find('[role="tabpanel"]').attr('role', 'presentation');
            } else if ($el.is('[role="tabpanel"]')) {
                // Make sure tabpanels have proper accessibility
                if (!$el.attr('aria-labelledby')) {
                    const id = 'tabpanel-' + Math.floor(Math.random() * 10000);
                    $el.attr('id', id);
                    const tab = $(`[aria-controls="${$el.attr('id')}"]`);
                    if (tab.length) {
                        tab.attr('aria-labelledby', id);
                    }
                }
            }
            
            stats.ariaFixed++;
            modified = true;
        });
        
        // 4. Extract inline styles to external CSS
        const elementsWithStyles = $('[style]');
        let cssRulesForFile = '';
        
        elementsWithStyles.each((i, el) => {
            const $el = $(el);
            const inlineStyle = $el.attr('style');
            
            // Skip empty rulesets
            if (!inlineStyle || inlineStyle.trim() === '' || inlineStyle.trim() === '{}') {
                $el.removeAttr('style'); // Remove empty style attributes
                return;
            }
            
            // Generate a selector based on element attributes
            let selector = '';
            const tagName = el.tagName.toLowerCase();
            const id = $el.attr('id');
            const classes = $el.attr('class');
            
            if (id) {
                selector = `#${id}`;
            } else if (classes) {
                // Create a unique class name
                const uniqueClass = `auto-gen-${cssClassCounter++}`;
                $el.addClass(uniqueClass);
                selector = `.${uniqueClass}`;
            } else {
                // Use a data attribute as selector
                const uniqueAttr = `data-autogen-${cssClassCounter++}`;
                $el.attr(uniqueAttr, '');
                selector = `[${uniqueAttr}]`;
            }
            
            // Add the CSS to our collection
            cssRulesForFile += `/* From: ${path.basename(filePath)} */\n`;
            cssRulesForFile += `${selector} {\n  ${inlineStyle}\n}\n\n`;
            
            // Remove the inline style
            $el.removeAttr('style');
            
            stats.inlineStylesRemoved++;
            stats.cssRulesAdded++;
            modified = true;
        });
        
        // Add the CSS rules to our main CSS collection
        extractedCSS += cssRulesForFile;
        
        // Add CSS link to the head if we've extracted styles and don't already have the link
        if (cssRulesForFile && !$(`link[href*="auto-generated-styles.css"]`).length) {
            const relativeCssPath = getRelativePath(filePath);
            $('head').append(`<link rel="stylesheet" href="${relativeCssPath}">`);
            modified = true;
        }
        
        // Save the modified file if changes were made
        if (modified) {
            fs.writeFileSync(filePath, $.html());
            stats.filesProcessed++;
        }
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error);
    }
}

// Run the script
processAllFiles();
