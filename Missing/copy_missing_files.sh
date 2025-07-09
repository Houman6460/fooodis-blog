#!/bin/bash

# Define directories
SRC_DIR="/Users/houmanghavamzadeh/CascadeProjects/FoodisWebsite 2/fooodis blog system with email marketing 2"
DEST_DIR="/Users/houmanghavamzadeh/CascadeProjects/FoodisWebsite 2/Missing"

# Create subdirectories in the destination
mkdir -p "$DEST_DIR/images"
mkdir -p "$DEST_DIR/images/media"
mkdir -p "$DEST_DIR/images/social"
mkdir -p "$DEST_DIR/js"
mkdir -p "$DEST_DIR/js/modules"
mkdir -p "$DEST_DIR/css"

# 1. Copy empty/placeholder image files (1-byte files)
echo "Copying placeholder/empty image files..."
find "$SRC_DIR/images" -type f -size 1c -exec cp -v {} "$DEST_DIR/images/" \;

# 2. Copy missing image files (those with no content)
echo "Copying missing image files..."
cp -v "$SRC_DIR/images/customer-data.jpg" "$DEST_DIR/images/" 2>/dev/null
cp -v "$SRC_DIR/images/inventory-management.jpg" "$DEST_DIR/images/" 2>/dev/null
cp -v "$SRC_DIR/images/loyalty-program.jpg" "$DEST_DIR/images/" 2>/dev/null
cp -v "$SRC_DIR/images/menu-design.jpg" "$DEST_DIR/images/" 2>/dev/null
cp -v "$SRC_DIR/images/online-ordering.jpg" "$DEST_DIR/images/" 2>/dev/null
cp -v "$SRC_DIR/images/pos-system.jpg" "$DEST_DIR/images/" 2>/dev/null

# 3. Create marker files for empty directories
echo "Creating marker files for empty directories..."
touch "$DEST_DIR/images/media/.placeholder"
touch "$DEST_DIR/images/social/.placeholder"

# 4. Copy incomplete JS files (1-byte or empty files)
echo "Copying incomplete JS files..."
find "$SRC_DIR/js" -type f -size -2c -exec cp -v {} "$DEST_DIR/js/" \;

# 5. Copy JS files with no size info (they exist but have no content)
echo "Copying JS files with no size info..."
cp -v "$SRC_DIR/js/ai-automation-v2-dom-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/ai-automation-v2-events.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/ai-automation-v2-loader.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/ai-automation-v2-scheduler.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/ai-automation-v2-status-cards.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/ai-automation-v2.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/automation-card-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/banner-management.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/blog-layout-manager.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/card-stats-enhancer.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/direct-automation-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/direct-label-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/emergency-v2-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/enhanced-banner-fixed.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/fixes-integration.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/force-v2-section.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/icon-stabilizer.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/immediate-accessibility-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/immediate-init.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/post-view-counter.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/react-share-stabilizer.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/schedule-fix-v2.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/schedule-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/standalone-v2-section.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/stats-critical-fix.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/status-card-rebuild.js" "$DEST_DIR/js/" 2>/dev/null
cp -v "$SRC_DIR/js/storage-initialization-fix.js" "$DEST_DIR/js/" 2>/dev/null

# 6. Copy module files with missing content
echo "Copying module files with missing content..."
cp -v "$SRC_DIR/js/modules/automation-time-fix.js" "$DEST_DIR/js/modules/" 2>/dev/null
cp -v "$SRC_DIR/js/modules/execution-manager.js" "$DEST_DIR/js/modules/" 2>/dev/null
cp -v "$SRC_DIR/js/modules/module-loader.js" "$DEST_DIR/js/modules/" 2>/dev/null
cp -v "$SRC_DIR/js/modules/scheduler-manager.js" "$DEST_DIR/js/modules/" 2>/dev/null

# 7. Copy missing CSS files
echo "Copying missing CSS files..."
cp -v "$SRC_DIR/css/banner-management.css" "$DEST_DIR/css/" 2>/dev/null
cp -v "$SRC_DIR/css/banner-preview.css" "$DEST_DIR/css/" 2>/dev/null
cp -v "$SRC_DIR/css/blog-styles.css" "$DEST_DIR/css/" 2>/dev/null

# Create a manifest file
echo "Creating manifest file..."
echo "Missing Files Manifest - $(date)" > "$DEST_DIR/manifest.txt"
echo "===================================" >> "$DEST_DIR/manifest.txt"
echo "" >> "$DEST_DIR/manifest.txt"

echo "1. Image Files:" >> "$DEST_DIR/manifest.txt"
find "$DEST_DIR/images" -type f -not -name ".placeholder" | sort >> "$DEST_DIR/manifest.txt"
echo "" >> "$DEST_DIR/manifest.txt"

echo "2. JavaScript Files:" >> "$DEST_DIR/manifest.txt"
find "$DEST_DIR/js" -type f -not -path "*/modules/*" | sort >> "$DEST_DIR/manifest.txt"
echo "" >> "$DEST_DIR/manifest.txt"

echo "3. Module Files:" >> "$DEST_DIR/manifest.txt"
find "$DEST_DIR/js/modules" -type f | sort >> "$DEST_DIR/manifest.txt"
echo "" >> "$DEST_DIR/manifest.txt"

echo "4. CSS Files:" >> "$DEST_DIR/manifest.txt"
find "$DEST_DIR/css" -type f | sort >> "$DEST_DIR/manifest.txt"

echo "Process completed. Check the manifest file for a summary."
