const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configure paths
const rootDir = path.resolve(__dirname, '..');

// Track stats
let stats = {
    filesProcessed: 0,
    ariaRolesFix: 0,
    accessibilityFix: 0,
    inlineStylesFix: 0,
    compatibilityFix: 0,
    duplicateMetaFix: 0
};

// External CSS file to store extracted inline styles
const cssFilePath = path.join(__dirname, 'auto-generated-styles-final.css');
let extractedStyles = '/* Auto-generated CSS from fix-final-issues.js */\n\n';
let uniqueClassCounter = 0;

// Process all HTML files
function processAllFiles() {
    console.log('Starting to fix remaining issues...');
    
    // Get all HTML files recursively
    const htmlFiles = findAllHtmlFiles(rootDir);
    
    console.log(`Found ${htmlFiles.length} HTML files to process`);
    
    // Process each file
    htmlFiles.forEach(file => {
        processFile(file);
    });

    // Save extracted CSS if there are any styles
    if (extractedStyles.length > 50) {
        fs.writeFileSync(cssFilePath, extractedStyles);
        console.log(`Saved extracted styles to ${cssFilePath}`);
    }
    
    console.log('\nCompleted fixing issues:');
    console.log(`- Files processed: ${stats.filesProcessed}`);
    console.log(`- ARIA roles fixed: ${stats.ariaRolesFix}`);
    console.log(`- Accessibility issues fixed: ${stats.accessibilityFix}`);
    console.log(`- Inline styles fixed: ${stats.inlineStylesFix}`);
    console.log(`- Browser compatibility issues fixed: ${stats.compatibilityFix}`);
    console.log(`- Duplicate meta elements fixed: ${stats.duplicateMetaFix}`);
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
    const filename = path.basename(filePath);
    console.log(`Processing: ${filename}`);
    
    try {
        // Read file
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        let modified = false;

        // 1. Fix ARIA role structure issues
        modified = fixAriaRoleStructure($, filePath) || modified;
        
        // 2. Fix accessibility warnings (add missing title attributes)
        modified = fixAccessibility($, filePath) || modified;
        
        // 3. Fix inline styles
        modified = extractInlineStyles($, filePath) || modified;
        
        // 4. Fix browser compatibility issues
        modified = fixBrowserCompatibility($, filePath) || modified;
        
        // 5. Fix duplicate meta tags
        modified = fixDuplicateMetaTags($, filePath) || modified;
        
        // Add the link to the CSS file if we extracted any styles
        if (modified && $('link[href*="auto-generated-styles-final.css"]').length === 0) {
            $('head').append('<link rel="stylesheet" href="/assets/auto-generated-styles-final.css">');
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

// Fix ARIA role structure issues
function fixAriaRoleStructure($, filePath) {
    let modified = false;
    
    // Fix issue: role="tab" with children img[tabindex] or h3[tabindex]
    $('[role="tab"] img[tabindex], [role="tab"] h3[tabindex]').each((i, el) => {
        const $el = $(el);
        
        // Remove tabindex from img and h3 within tabs
        $el.removeAttr('tabindex');
        
        // Add alt attribute to images without one
        if (el.tagName.toLowerCase() === 'img' && !$el.attr('alt')) {
            $el.attr('alt', 'Tab image');
        }
        
        // Add title attribute if missing
        if (!$el.attr('title')) {
            const alt = $el.attr('alt');
            if (alt) {
                $el.attr('title', alt);
            } else if (el.tagName.toLowerCase() === 'h3') {
                $el.attr('title', $el.text().trim() || 'Tab heading');
            }
        }
        
        stats.ariaRolesFix++;
        modified = true;
    });
    
    // Fix issue: role="tablist" with children role="presentation"
    $('[role="tablist"] [role="presentation"]').each((i, el) => {
        $(el).removeAttr('role');
        stats.ariaRolesFix++;
        modified = true;
    });
    
    // Fix issue: role="tablist" with children role="tabpanel"
    $('[role="tablist"] [role="tabpanel"]').each((i, el) => {
        const $tabpanel = $(el);
        const $tablist = $tabpanel.parent('[role="tablist"]');
        
        // Move tabpanel after the tablist
        $tablist.after($tabpanel);
        stats.ariaRolesFix++;
        modified = true;
    });
    
    return modified;
}

// Fix accessibility warnings
function fixAccessibility($, filePath) {
    let modified = false;
    
    // Add title to links without one
    $('a:not([title])').each((i, el) => {
        const $el = $(el);
        const linkText = $el.text().trim();
        
        if (linkText) {
            $el.attr('title', linkText);
            modified = true;
            stats.accessibilityFix++;
        } else {
            // For links with only images, use image alt text or fallback
            const $img = $el.find('img');
            if ($img.length > 0) {
                const imgAlt = $img.attr('alt');
                if (imgAlt) {
                    $el.attr('title', imgAlt);
                } else {
                    $el.attr('title', 'Link');
                    $img.attr('alt', 'Link image');
                }
                modified = true;
                stats.accessibilityFix++;
            }
        }
    });
    
    // Add title to ARIA input fields
    $('[tabindex]:not([title]):not(a):not(button)').each((i, el) => {
        const $el = $(el);
        const ariaLabel = $el.attr('aria-label');
        const ariaLabelledby = $el.attr('aria-labelledby');
        
        // If element has aria-label, use that for title
        if (ariaLabel) {
            $el.attr('title', ariaLabel);
            modified = true;
            stats.accessibilityFix++;
        }
        // If element has aria-labelledby, find the referenced element and use its text
        else if (ariaLabelledby) {
            const labelText = $(`#${ariaLabelledby}`).text().trim();
            if (labelText) {
                $el.attr('title', labelText);
                modified = true;
                stats.accessibilityFix++;
            }
        }
        // Otherwise, use a descriptive title based on role
        else {
            const role = $el.attr('role');
            if (role) {
                $el.attr('title', `${role.charAt(0).toUpperCase() + role.slice(1)} control`);
            } else {
                $el.attr('title', 'Interactive element');
            }
            modified = true;
            stats.accessibilityFix++;
        }
    });
    
    // Add alt to images without one
    $('img:not([alt])').each((i, el) => {
        $(el).attr('alt', 'Image');
        modified = true;
        stats.accessibilityFix++;
    });
    
    return modified;
}

// Extract inline styles to external CSS file
function extractInlineStyles($, filePath) {
    let modified = false;
    const filename = path.basename(filePath, '.html');
    
    // Find elements with inline styles
    $('[style]').each((i, el) => {
        const $el = $(el);
        const inlineStyle = $el.attr('style');
        
        // Skip if no inline style
        if (!inlineStyle || inlineStyle.trim() === '') {
            return;
        }
        
        // Create a unique class name for this element
        const uniqueClass = `extracted-${filename.replace(/[^a-z0-9]/gi, '-')}-${uniqueClassCounter++}`;
        
        // Add the new class to the element
        const currentClass = $el.attr('class');
        $el.attr('class', currentClass ? `${currentClass} ${uniqueClass}` : uniqueClass);
        
        // Add the style to the external CSS
        extractedStyles += `.${uniqueClass} {\n  ${inlineStyle}\n}\n\n`;
        
        // Remove the inline style
        $el.removeAttr('style');
        
        modified = true;
        stats.inlineStylesFix++;
    });
    
    return modified;
}

// Fix browser compatibility issues
function fixBrowserCompatibility($, filePath) {
    let modified = false;
    
    // Fix issue: user-select without -webkit-user-select
    $('style').each((i, el) => {
        let styleContent = $(el).html();
        
        // Add vendor prefixes for user-select
        if (styleContent.includes('user-select') && !styleContent.includes('-webkit-user-select')) {
            styleContent = styleContent.replace(
                /user-select:\s*([^;]+);/g, 
                '-webkit-user-select: $1; user-select: $1;'
            );
            $(el).html(styleContent);
            modified = true;
            stats.compatibilityFix++;
        }
        
        // Replace transparency with opacity
        if (styleContent.includes('transparency')) {
            styleContent = styleContent.replace(
                /transparency:\s*([^;]+);/g, 
                'opacity: $1;'
            );
            $(el).html(styleContent);
            modified = true;
            stats.compatibilityFix++;
        }
    });
    
    // Fix inline styles with transparency (unlikely if we extracted them, but check anyway)
    $('[style*="transparency"]').each((i, el) => {
        const $el = $(el);
        const style = $el.attr('style');
        const newStyle = style.replace(
            /transparency:\s*([^;]+);/g, 
            'opacity: $1;'
        );
        $el.attr('style', newStyle);
        modified = true;
        stats.compatibilityFix++;
    });
    
    // Add cross-browser support for scrollbar-width
    $('[style*="scrollbar-width"]').each((i, el) => {
        const $el = $(el);
        const style = $el.attr('style');
        let newStyle = style;
        
        // Add webkit scrollbar if needed
        if (style.includes('scrollbar-width: none') && !style.includes('::-webkit-scrollbar')) {
            // Add style to hide webkit scrollbars in the document
            if ($('style#webkit-scrollbar-fix').length === 0) {
                $('head').append('<style id="webkit-scrollbar-fix">*::-webkit-scrollbar { display: none !important; }</style>');
            }
        }
        
        $el.attr('style', newStyle);
        modified = true;
        stats.compatibilityFix++;
    });
    
    // Replace -webkit-overflow-scrolling with standard overflow properties
    $('[style*="-webkit-overflow-scrolling"]').each((i, el) => {
        const $el = $(el);
        const style = $el.attr('style');
        const newStyle = style
            .replace(/-webkit-overflow-scrolling:\s*touch;/g, 'overflow-y: auto; -webkit-overflow-scrolling: touch;');
        $el.attr('style', newStyle);
        modified = true;
        stats.compatibilityFix++;
    });
    
    return modified;
}

// Fix duplicate meta tags
function fixDuplicateMetaTags($, filePath) {
    let modified = false;
    
    // Check for duplicate charset meta tags
    const charsetMeta = $('meta[charset]');
    if (charsetMeta.length > 1) {
        // Keep only the first charset meta
        charsetMeta.slice(1).remove();
        modified = true;
        stats.duplicateMetaFix += charsetMeta.length - 1;
    }
    
    // Check for duplicate viewport meta tags
    const viewportMeta = $('meta[name="viewport"]');
    if (viewportMeta.length > 1) {
        // Keep only the first viewport meta
        viewportMeta.slice(1).remove();
        modified = true;
        stats.duplicateMetaFix += viewportMeta.length - 1;
    }
    
    return modified;
}

// Run the script
processAllFiles();
