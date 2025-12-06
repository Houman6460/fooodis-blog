#!/bin/bash

# Fooodis Image Optimization Script
# Converts PNG/JPG images to WebP format for 60-70% size reduction
# Usage: ./scripts/optimize-images.sh [--dry-run]

set -e

IMAGES_DIR="/Users/houman/CascadeProjects/fooodis-blog/images"
WEBP_DIR="/Users/houman/CascadeProjects/fooodis-blog/images-webp"
DRY_RUN=false
QUALITY=80  # WebP quality (0-100)

# Parse arguments
if [[ "$1" == "--dry-run" ]]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No files will be modified"
fi

# Check for cwebp
if ! command -v cwebp &> /dev/null; then
    echo "❌ cwebp not found. Install with: brew install webp"
    exit 1
fi

# Create output directory
if [[ "$DRY_RUN" == false ]]; then
    mkdir -p "$WEBP_DIR"
fi

# Count files
PNG_COUNT=$(find "$IMAGES_DIR" -name "*.png" | wc -l | tr -d ' ')
JPG_COUNT=$(find "$IMAGES_DIR" -name "*.jpg" -o -name "*.jpeg" | wc -l | tr -d ' ')
TOTAL_COUNT=$((PNG_COUNT + JPG_COUNT))

echo "📊 Image Analysis:"
echo "   PNG files: $PNG_COUNT"
echo "   JPG files: $JPG_COUNT"
echo "   Total: $TOTAL_COUNT"
echo ""

# Calculate original size
ORIGINAL_SIZE=$(du -sh "$IMAGES_DIR" | cut -f1)
echo "📁 Original size: $ORIGINAL_SIZE"
echo ""

if [[ "$DRY_RUN" == true ]]; then
    echo "🔍 Files that would be converted:"
    find "$IMAGES_DIR" -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \) | head -20
    echo "   ... and $((TOTAL_COUNT - 20)) more"
    exit 0
fi

# Convert images
echo "🔄 Converting images to WebP (quality: $QUALITY)..."
echo ""

CONVERTED=0
FAILED=0
SAVED_BYTES=0

# Process PNG files
find "$IMAGES_DIR" -name "*.png" | while read -r file; do
    filename=$(basename "$file" .png)
    relpath=$(dirname "${file#$IMAGES_DIR/}")
    outdir="$WEBP_DIR/$relpath"
    mkdir -p "$outdir"
    outfile="$outdir/$filename.webp"
    
    if cwebp -q $QUALITY "$file" -o "$outfile" 2>/dev/null; then
        orig_size=$(stat -f%z "$file")
        new_size=$(stat -f%z "$outfile")
        savings=$((orig_size - new_size))
        percent=$((savings * 100 / orig_size))
        echo "✅ $filename.png → $filename.webp (-${percent}%)"
        CONVERTED=$((CONVERTED + 1))
        SAVED_BYTES=$((SAVED_BYTES + savings))
    else
        echo "❌ Failed: $file"
        FAILED=$((FAILED + 1))
    fi
done

# Process JPG files
find "$IMAGES_DIR" \( -name "*.jpg" -o -name "*.jpeg" \) | while read -r file; do
    ext="${file##*.}"
    filename=$(basename "$file" ".$ext")
    relpath=$(dirname "${file#$IMAGES_DIR/}")
    outdir="$WEBP_DIR/$relpath"
    mkdir -p "$outdir"
    outfile="$outdir/$filename.webp"
    
    if cwebp -q $QUALITY "$file" -o "$outfile" 2>/dev/null; then
        orig_size=$(stat -f%z "$file")
        new_size=$(stat -f%z "$outfile")
        savings=$((orig_size - new_size))
        percent=$((savings * 100 / orig_size))
        echo "✅ $filename.$ext → $filename.webp (-${percent}%)"
    else
        echo "❌ Failed: $file"
    fi
done

echo ""
echo "📊 Conversion Complete!"
NEW_SIZE=$(du -sh "$WEBP_DIR" 2>/dev/null | cut -f1 || echo "N/A")
echo "   Original: $ORIGINAL_SIZE"
echo "   WebP: $NEW_SIZE"
echo ""
echo "💡 Next steps:"
echo "   1. Review converted images in $WEBP_DIR"
echo "   2. Run: mv images images-original && mv images-webp images"
echo "   3. Update HTML/CSS references from .png/.jpg to .webp"
echo "   4. Or use <picture> element for fallback support"
