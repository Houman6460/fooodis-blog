
/**
 * Script bundling optimizer for Fooodis Blog System
 * Combines and minifies JavaScript files for better performance
 */

const fs = require('fs');
const path = require('path');

class BundleOptimizer {
    constructor() {
        this.jsFiles = [
            'js/storage-manager.js',
            'js/auth-manager.js',
            'js/dashboard.js',
            'js/blog-stats-dashboard.js',
            'js/category-sync-manager.js',
            'js/ai-automation.js'
        ];
        
        this.cssFiles = [
            'css/dashboard.css',
            'css/dashboard-styles.css',
            'css/blog-stats-dashboard.css',
            'css/ai-automation-dark.css'
        ];
    }

    async bundleJS() {
        console.log('📦 Bundling JavaScript files...');
        
        let bundledJS = '';
        
        for (const file of this.jsFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundledJS += `\n/* ${file} */\n${content}\n`;
            }
        }
        
        // Write bundled file
        fs.writeFileSync('js/dashboard-bundle.js', bundledJS);
        console.log('✅ JavaScript bundle created: js/dashboard-bundle.js');
    }

    async bundleCSS() {
        console.log('🎨 Bundling CSS files...');
        
        let bundledCSS = '';
        
        for (const file of this.cssFiles) {
            if (fs.existsSync(file)) {
                const content = fs.readFileSync(file, 'utf8');
                bundledCSS += `\n/* ${file} */\n${content}\n`;
            }
        }
        
        // Write bundled file
        fs.writeFileSync('css/dashboard-bundle.css', bundledCSS);
        console.log('✅ CSS bundle created: css/dashboard-bundle.css');
    }

    async optimize() {
        await this.bundleJS();
        await this.bundleCSS();
        console.log('🚀 Optimization complete!');
    }
}

// Run if called directly
if (require.main === module) {
    const optimizer = new BundleOptimizer();
    optimizer.optimize();
}

module.exports = BundleOptimizer;
