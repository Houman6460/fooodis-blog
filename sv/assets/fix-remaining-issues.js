const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configure paths
const rootDir = path.resolve(__dirname, '..');
const cssOutputPath = path.join(rootDir, 'assets', 'auto-generated-styles-part2.css');

// Track stats
let stats = {
    filesProcessed: 0,
    ariaRolesFixed: 0,
    accessibilityFixed: 0,
    inlineStylesRemoved: 0,
    browserCompatibilityFixed: 0
};

// Store extracted CSS
let extractedCSS = '/* Auto-generated styles (round 2) - ' + new Date().toISOString() + ' */\n\n';
let cssClassCounter = 0;

// Process all HTML files
function processAllFiles() {
    console.log('Starting to fix remaining HTML issues...');
    
    // Get problematic files first - focus on the ones with most issues
    const priorityFiles = [
        path.join(rootDir, 'Add-staff.html'),
        path.join(rootDir, 'Apps.html'),
        path.join(rootDir, 'Delivery.html'),
        path.join(rootDir, 'Dine-in.html'),
        path.join(rootDir, 'Expenses.html'),
        path.join(rootDir, 'index.html'),
        path.join(rootDir, 'Kitchen-Disply-System.html'),
        path.join(rootDir, 'Live-order.html'),
        path.join(rootDir, 'Order-Time.html'),
        path.join(rootDir, 'Pos.html'),
        path.join(rootDir, 'Qr-cod.html')
    ];
    
    // Process priority files first
    console.log(`Processing ${priorityFiles.length} priority files with most issues...`);
    priorityFiles.forEach(file => {
        if (fs.existsSync(file)) {
            processFile(file);
        } else {
            console.log(`Warning: File not found: ${file}`);
        }
    });
    
    // Process all other HTML files
    const allHtmlFiles = findAllHtmlFiles(rootDir);
    console.log(`Processing all remaining files (${allHtmlFiles.length} total files)...`);
    
    allHtmlFiles.forEach(file => {
        // Skip priority files as they've already been processed
        if (!priorityFiles.includes(file)) {
            processFile(file);
        }
    });
    
    // Write all extracted CSS to file
    fs.writeFileSync(cssOutputPath, extractedCSS);
    
    console.log('\nCompleted processing all files:');
    console.log(`- Files processed: ${stats.filesProcessed}`);
    console.log(`- ARIA roles fixed: ${stats.ariaRolesFixed}`);
    console.log(`- Accessibility issues fixed: ${stats.accessibilityFixed}`);
    console.log(`- Additional inline styles removed: ${stats.inlineStylesRemoved}`);
    console.log(`- Browser compatibility issues fixed: ${stats.browserCompatibilityFixed}`);
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

// Process a single file
function processFile(filePath) {
    console.log(`Processing: ${filePath}`);
    
    try {
        // Read file
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        let modified = false;
        
        // 1. Fix ARIA role structure issues
        // This is a complex problem, we need to restructure elements with incorrect children
        $('[role="tab"], [role="tablist"], [role="tabpanel"]').each((i, el) => {
            const $el = $(el);
            
            // Handle tablist with incorrect children
            if ($el.is('[role="tablist"]')) {
                // Remove role="presentation" from direct children to fix "Element has children which are not allowed: [role=presentation]"
                $el.children('[role="presentation"]').removeAttr('role');
                
                // Make sure tabpanels are not direct children of tablists
                $el.children('[role="tabpanel"]').each((i, panel) => {
                    $(panel).removeAttr('role');
                });
                
                stats.ariaRolesFixed++;
                modified = true;
            }
            
            // Fix tabs with images or h3 elements that have tabindex
            if ($el.is('[role="tab"]')) {
                // For tabs with img[tabindex]
                $el.find('img[tabindex]').each((i, img) => {
                    const $img = $(img);
                    // Convert to a more appropriate structure or add required attributes
                    if (!$img.attr('title')) {
                        $img.attr('title', $img.attr('alt') || 'Tab image');
                    }
                    
                    // Remove tabindex if it's causing issues
                    if ($img.attr('tabindex')) {
                        $img.removeAttr('tabindex');
                    }
                });
                
                // Fix h3[tabindex]
                $el.find('h3[tabindex]').each((i, h3) => {
                    $(h3).removeAttr('tabindex');
                    if (!$(h3).attr('aria-label')) {
                        $(h3).attr('aria-label', $(h3).text().trim());
                    }
                });
                
                stats.ariaRolesFixed++;
                modified = true;
            }
            
            // Fix tabpanel structure issues
            if ($el.is('[role="tabpanel"]')) {
                // Check if this is in a tablist - if so, move it outside
                if ($el.parent().is('[role="tablist"]')) {
                    $el.parent().after($el);
                    modified = true;
                }
                
                stats.ariaRolesFixed++;
            }
        });
        
        // 2. Fix ARIA attribute issues - remove unsupported attributes
        $('[aria-expanded="true"]').each((i, el) => {
            // Check if this element should have aria-expanded
            const $el = $(el);
            const role = $el.attr('role');
            
            // aria-expanded is appropriate for certain roles like button, but not for others
            // If the element doesn't match the allowed roles, remove the attribute
            if (!['button', 'combobox', 'link', 'switch', 'tab', 'treeitem'].includes(role)) {
                $el.removeAttr('aria-expanded');
                stats.ariaRolesFixed++;
                modified = true;
            }
        });
        
        // 3. Fix accessibility issues - add missing title attributes
        // Links with no discernible text
        $('a:not([title]):has(img:not([alt]))').each((i, link) => {
            const $link = $(link);
            const linkText = $link.text().trim();
            const imgSrc = $link.find('img').attr('src') || '';
            const imgName = path.basename(imgSrc).split('.')[0] || '';
            
            // Set title attribute based on available info
            $link.attr('title', linkText || imgName || 'Link');
            
            // Also fix the img inside
            $link.find('img:not([alt])').attr('alt', linkText || imgName || 'Image');
            
            stats.accessibilityFixed++;
            modified = true;
        });
        
        // Elements with tabindex need accessible names
        $('[tabindex]:not([title]):not(a):not(button)').each((i, el) => {
            const $el = $(el);
            let text = $el.text().trim();
            
            if (!text && $el.attr('src')) {
                // For images, use filename as fallback
                const src = $el.attr('src');
                text = path.basename(src).split('.')[0].replace(/-|_/g, ' ');
            }
            
            $el.attr('title', text || 'Interactive element');
            stats.accessibilityFixed++;
            modified = true;
        });
        
        // 4. Fix browser compatibility issues
        // Add vendor prefixes for user-select
        $('[style*="user-select"]').each((i, el) => {
            const $el = $(el);
            const style = $el.attr('style');
            
            if (style && style.includes('user-select') && !style.includes('-webkit-user-select')) {
                const updatedStyle = style.replace(
                    /(user-select\s*:\s*([^;]+))/g, 
                    '-webkit-user-select: $2; -moz-user-select: $2; $1'
                );
                $el.attr('style', updatedStyle);
                stats.browserCompatibilityFixed++;
                modified = true;
            }
        });
        
        // Fix transparency (not valid CSS)
        $('[style*="transparency"]').each((i, el) => {
            const $el = $(el);
            let style = $el.attr('style');
            
            if (style) {
                // Replace transparency with opacity
                style = style.replace(/transparency\s*:\s*([^;]+)/g, function(match, value) {
                    // Convert to opacity (inverse of transparency)
                    const numValue = parseFloat(value);
                    const opacity = isNaN(numValue) ? "1" : (1 - numValue);
                    return `opacity: ${opacity}`;
                });
                
                $el.attr('style', style);
                stats.browserCompatibilityFixed++;
                modified = true;
            }
        });
        
        // 5. Extract ALL remaining inline styles
        const elementsWithStyles = $('[style]');
        
        if (elementsWithStyles.length > 0) {
            let cssRulesForFile = '';
            elementsWithStyles.each((i, el) => {
                const $el = $(el);
                const inlineStyle = $el.attr('style');
                
                // Skip empty or already processed styles
                if (!inlineStyle || inlineStyle.trim() === '' || inlineStyle.trim() === '{}') {
                    $el.removeAttr('style');
                    return;
                }
                
                // Create a unique class name
                const uniqueClass = `fix2-${path.basename(filePath, '.html')}-${cssClassCounter++}`;
                
                // Add the class to the element
                $el.addClass(uniqueClass);
                
                // Add the CSS to our collection
                cssRulesForFile += `/* From: ${path.basename(filePath)} */\n`;
                cssRulesForFile += `.${uniqueClass} {\n  ${inlineStyle}\n}\n\n`;
                
                // Remove the inline style
                $el.removeAttr('style');
                
                stats.inlineStylesRemoved++;
            });
            
            // Add CSS rules to the main collection
            extractedCSS += cssRulesForFile;
            
            // Add CSS link if not already present
            if (!$('link[href*="auto-generated-styles-part2.css"]').length) {
                // Determine relative path
                const relDir = path.relative(path.dirname(filePath), rootDir);
                const relativeCssPath = relDir ? 
                    path.join(relDir, 'assets/auto-generated-styles-part2.css').replace(/\\/g, '/') : 
                    'assets/auto-generated-styles-part2.css';
                
                $('head').append(`<link rel="stylesheet" href="${relativeCssPath}">`);
                modified = true;
            }
        }
        
        // Fix duplicate meta tags (remove extras)
        if (path.basename(filePath) === 'index.html') {
            // Keep only the first charset and viewport
            let foundCharset = false;
            $('meta[charset]').each((i, el) => {
                if (foundCharset) {
                    $(el).remove();
                    modified = true;
                } else {
                    foundCharset = true;
                }
            });
            
            let foundViewport = false;
            $('meta[name="viewport"]').each((i, el) => {
                if (foundViewport) {
                    $(el).remove();
                    modified = true;
                } else {
                    foundViewport = true;
                }
            });
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
