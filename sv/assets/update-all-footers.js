// Script to update all HTML files with the unified footer loader
// Run this script with Node.js

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Base directories
const rootDir = path.resolve(__dirname, '..');
const svDir = path.join(rootDir, 'sv');
const blogDir = path.join(rootDir, 'blog');
const svBlogDir = path.join(rootDir, 'sv', 'blog');
const excludeDirs = [path.join(rootDir, 'node_modules'), path.join(rootDir, 'assets')];

async function processFile(filePath) {
    try {
        // Read the file
        let content = await readFileAsync(filePath, 'utf8');
        
        // Check if the file already has the footer loader
        if (content.includes('include-footer.js')) {
            console.log(`${filePath} already has footer loader`);
            return false;
        }

        // Check if file is in the Swedish directory structure
        const isSv = filePath.includes('/sv/');
        const scriptPath = isSv ? '../assets/include-footer.js' : 'assets/include-footer.js';
        
        // Replace the closing body tag with our footer loader and then the closing body tag
        const updatedContent = content.replace(
            '</body>',
            `  <!-- Unified Footer Loader -->  
  <script src="${scriptPath}"></script>
</body>`
        );

        // Only write if content changed
        if (content !== updatedContent) {
            await writeFileAsync(filePath, updatedContent);
            return true;
        }
        
        return false;
    } catch (err) {
        console.error(`Error processing ${filePath}:`, err);
        return false;
    }
}

async function findHtmlFiles(dir, fileList = []) {
    try {
        // Skip excluded directories
        if (excludeDirs.some(excludeDir => dir.startsWith(excludeDir))) {
            return fileList;
        }
        
        const files = await readdirAsync(dir);
        
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = await statAsync(filePath);
            
            if (stat.isDirectory()) {
                // Recursively process subdirectories
                await findHtmlFiles(filePath, fileList);
            } else if (file.toLowerCase().endsWith('.html')) {
                fileList.push(filePath);
            }
        }
        
        return fileList;
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err);
        return fileList;
    }
}

async function main() {
    try {
        console.log('Starting footer update process...');
        
        // Find all HTML files
        const htmlFiles = await findHtmlFiles(rootDir);
        console.log(`Found ${htmlFiles.length} HTML files to process`);
        
        // Process each HTML file
        let updatedCount = 0;
        for (const file of htmlFiles) {
            const updated = await processFile(file);
            if (updated) {
                updatedCount++;
                console.log(`Updated: ${file}`);
            }
        }
        
        console.log(`Footer update complete. Updated ${updatedCount} files.`);
    } catch (err) {
        console.error('Error in main process:', err);
    }
}

main();
