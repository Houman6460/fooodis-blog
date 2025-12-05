/**
 * Script to add header scroll effect to all HTML files
 */
const fs = require('fs');
const path = require('path');

// Config
const rootDir = path.resolve(__dirname, '..');
const scriptTag = '<script src="assets/header-scroll-effect.js" defer></script>';
const headerEffectPath = path.join(rootDir, 'assets', 'header-scroll-effect.js');

// Stats
let stats = {
    filesProcessed: 0,
    filesUpdated: 0,
    filesSkipped: 0,
    errors: 0
};

// Function to find all HTML files recursively
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

// Function to add script to a file
function addScriptToFile(filePath) {
    console.log(`Processing: ${filePath}`);
    stats.filesProcessed++;
    
    try {
        // Read file
        let html = fs.readFileSync(filePath, 'utf8');
        
        // Check if script is already included
        if (html.includes('header-scroll-effect.js')) {
            console.log(`  - Script already exists, skipping: ${filePath}`);
            stats.filesSkipped++;
            return;
        }
        
        // Find location to insert the script - before closing head tag
        const headCloseIndex = html.indexOf('</head>');
        if (headCloseIndex === -1) {
            console.log(`  - No closing head tag found, skipping: ${filePath}`);
            stats.filesSkipped++;
            return;
        }
        
        // Insert the script tag
        const updatedHtml = html.slice(0, headCloseIndex) + 
                           '\n' + scriptTag + '\n' + 
                           html.slice(headCloseIndex);
        
        // Write updated file
        fs.writeFileSync(filePath, updatedHtml);
        console.log(`  - Added script successfully: ${filePath}`);
        stats.filesUpdated++;
    } catch (error) {
        console.error(`  - Error processing ${filePath}:`, error.message);
        stats.errors++;
    }
}

// Main function
function main() {
    console.log('Starting to add header scroll effect to all HTML files...');
    
    // Make sure the header-scroll-effect.js file exists
    if (!fs.existsSync(headerEffectPath)) {
        console.error(`Header scroll effect script not found at: ${headerEffectPath}`);
        return;
    }
    
    // Find all HTML files
    const htmlFiles = findAllHtmlFiles(rootDir);
    console.log(`Found ${htmlFiles.length} HTML files to process`);
    
    // Process each file
    htmlFiles.forEach(file => {
        addScriptToFile(file);
    });
    
    console.log('\nCompleted:');
    console.log(`- Files processed: ${stats.filesProcessed}`);
    console.log(`- Files updated: ${stats.filesUpdated}`);
    console.log(`- Files skipped: ${stats.filesSkipped}`);
    console.log(`- Errors: ${stats.errors}`);
}

// Run the script
main();
