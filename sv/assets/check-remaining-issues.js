const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Configure paths
const rootDir = path.resolve(__dirname, '..');

// Track issues
let issues = {
    ariaRoleErrors: 0,
    accessibilityWarnings: 0,
    inlineStyles: 0,
    browserCompatibility: 0,
    total: 0
};

// Process all HTML files
function checkAllFiles() {
    console.log('Checking for remaining issues...');
    
    // Get all HTML files recursively
    const htmlFiles = findAllHtmlFiles(rootDir);
    
    console.log(`Scanning ${htmlFiles.length} HTML files...`);
    
    // Process each file
    htmlFiles.forEach(file => {
        checkFile(file);
    });
    
    console.log('\nRemaining issues found:');
    console.log(`- Total issues: ${issues.total}`);
    console.log(`- ARIA role structure issues: ${issues.ariaRoleErrors}`);
    console.log(`- Accessibility warnings: ${issues.accessibilityWarnings}`);
    console.log(`- Inline styles: ${issues.inlineStyles}`);
    console.log(`- Browser compatibility issues: ${issues.browserCompatibility}`);
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

// Check a single file for issues
function checkFile(filePath) {
    try {
        // Read file
        const html = fs.readFileSync(filePath, 'utf8');
        const $ = cheerio.load(html, { decodeEntities: false });
        const filename = path.basename(filePath);
        
        // Check for ARIA role issues
        const tablistWithPresentation = $('[role="tablist"] [role="presentation"]').length;
        const tabWithImgTabindex = $('[role="tab"] img[tabindex]').length;
        const tabWithH3Tabindex = $('[role="tab"] h3[tabindex]').length;
        const tabPanelInTablist = $('[role="tablist"] [role="tabpanel"]').length;
        
        const ariaIssues = tablistWithPresentation + tabWithImgTabindex + tabWithH3Tabindex + tabPanelInTablist;
        
        if (ariaIssues > 0) {
            console.log(`${filename}: Found ${ariaIssues} ARIA role structure issues`);
            issues.ariaRoleErrors += ariaIssues;
            issues.total += ariaIssues;
        }
        
        // Check for accessibility issues
        const linksNoTitle = $('a:not([title]):has(img:not([alt]))').length;
        const imgsNoAlt = $('img:not([alt])').length;
        const tabindexNoTitle = $('[tabindex]:not([title]):not(a):not(button)').length;
        
        const accessibilityIssues = linksNoTitle + imgsNoAlt + tabindexNoTitle;
        
        if (accessibilityIssues > 0) {
            console.log(`${filename}: Found ${accessibilityIssues} accessibility warnings`);
            issues.accessibilityWarnings += accessibilityIssues;
            issues.total += accessibilityIssues;
        }
        
        // Check for inline styles
        const inlineStyles = $('[style]').length;
        
        if (inlineStyles > 0) {
            console.log(`${filename}: Found ${inlineStyles} elements with inline styles`);
            issues.inlineStyles += inlineStyles;
            issues.total += inlineStyles;
        }
        
        // Check for browser compatibility issues
        const userSelectNoWebkit = $('[style*="user-select"]:not([style*="-webkit-user-select"])').length;
        const transparencyProps = $('[style*="transparency"]').length;
        
        const compatIssues = userSelectNoWebkit + transparencyProps;
        
        if (compatIssues > 0) {
            console.log(`${filename}: Found ${compatIssues} browser compatibility issues`);
            issues.browserCompatibility += compatIssues;
            issues.total += compatIssues;
        }
    } catch (error) {
        console.error(`Error checking ${filePath}:`, error);
    }
}

// Run the script
checkAllFiles();
