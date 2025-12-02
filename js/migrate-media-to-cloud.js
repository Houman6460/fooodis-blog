/**
 * Migration Tool: Move localStorage media to R2 cloud storage
 * Run this once to migrate existing local images to cloud
 */

async function migrateLocalMediaToCloud() {
    console.log('🔄 Starting media migration to R2 cloud...');
    
    // Get existing localStorage media
    const localMedia = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    
    if (localMedia.length === 0) {
        console.log('No local media to migrate');
        return { migrated: 0, failed: 0, skipped: 0 };
    }
    
    console.log(`Found ${localMedia.length} local media items to check`);
    
    let migrated = 0;
    let failed = 0;
    let skipped = 0;
    
    for (const item of localMedia) {
        // Skip if already has R2 URL (not base64)
        if (item.r2_url || (item.url && !item.url.startsWith('data:'))) {
            console.log(`✓ Skipping ${item.name} - already on cloud`);
            skipped++;
            continue;
        }
        
        // Only process base64 images
        if (!item.url || !item.url.startsWith('data:')) {
            console.log(`✓ Skipping ${item.name} - not a base64 image`);
            skipped++;
            continue;
        }
        
        try {
            console.log(`📤 Uploading ${item.name} to R2...`);
            
            // Convert base64 to blob
            const response = await fetch(item.url);
            const blob = await response.blob();
            
            // Create file from blob
            const file = new File([blob], item.name || 'image.jpg', { type: item.type || 'image/jpeg' });
            
            // Upload to R2
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folder', item.folder || 'uncategorized');
            formData.append('alt_text', item.name || '');
            
            const uploadResponse = await fetch('/api/media', {
                method: 'POST',
                body: formData
            });
            
            if (uploadResponse.ok) {
                const result = await uploadResponse.json();
                console.log(`✅ Migrated ${item.name} -> ${result.media?.r2_url}`);
                
                // Update local item with R2 URL
                item.r2_url = result.media?.r2_url || result.media?.url;
                item.url = item.r2_url;
                item.id = result.media?.id || item.id;
                
                migrated++;
            } else {
                console.error(`❌ Failed to migrate ${item.name}`);
                failed++;
            }
        } catch (error) {
            console.error(`❌ Error migrating ${item.name}:`, error);
            failed++;
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Save updated localStorage with R2 URLs
    localStorage.setItem('fooodis-blog-media', JSON.stringify(localMedia));
    
    console.log(`\n📊 Migration complete:`);
    console.log(`   ✅ Migrated: ${migrated}`);
    console.log(`   ⏭️ Skipped (already cloud): ${skipped}`);
    console.log(`   ❌ Failed: ${failed}`);
    
    // Reload from cloud to get fresh data
    if (window.loadMediaFromCloud) {
        await window.loadMediaFromCloud();
    }
    
    return { migrated, failed, skipped };
}

// Make globally available
window.migrateLocalMediaToCloud = migrateLocalMediaToCloud;

console.log('📦 Media migration tool loaded. Run migrateLocalMediaToCloud() to migrate local images to R2.');

/**
 * Clear all cached media data and reload from cloud
 */
async function clearMediaCacheAndReload() {
    console.log('🗑️ Clearing all cached media data...');
    
    // Clear localStorage
    localStorage.removeItem('fooodis-blog-media');
    
    // Clear any other media caches
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('media') || key.includes('image'))) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ Cache cleared. Reloading from cloud...');
    
    // Reload from cloud
    if (window.loadMediaFromCloud) {
        await window.loadMediaFromCloud();
    }
    
    // Refresh the display
    if (typeof filterMedia === 'function') {
        filterMedia();
    }
    
    console.log('✅ Media library refreshed from cloud');
    alert('Media cache cleared! The library now shows images from R2 cloud storage.');
}

window.clearMediaCacheAndReload = clearMediaCacheAndReload;

/**
 * COMPLETE CLEANUP - Clear everything and start fresh
 */
async function clearAllMediaEverywhere() {
    if (!confirm('⚠️ This will DELETE ALL media from:\n- Browser localStorage\n- Cloud database (D1)\n- Cloud storage (R2)\n\nAre you sure?')) {
        return;
    }
    
    console.log('🗑️ Starting complete media cleanup...');
    
    // 1. Clear localStorage
    localStorage.removeItem('fooodis-blog-media');
    for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.includes('media') || key.includes('image'))) {
            localStorage.removeItem(key);
        }
    }
    console.log('✅ localStorage cleared');
    
    // 2. Clear cloud storage via API
    try {
        const response = await fetch('/api/media/clear-all', {
            method: 'DELETE'
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Cloud storage cleared:', result);
        } else {
            console.error('❌ Failed to clear cloud storage');
        }
    } catch (error) {
        console.error('❌ Error clearing cloud:', error);
    }
    
    // 3. Refresh the page to show empty library
    console.log('✅ Complete cleanup done!');
    alert('✅ All media has been deleted!\n\nThe page will now refresh.\nYou can upload fresh images to R2 cloud storage.');
    
    // Refresh the media display
    if (typeof filterMedia === 'function') {
        filterMedia();
    }
    
    location.reload();
}

window.clearAllMediaEverywhere = clearAllMediaEverywhere;

console.log('🧹 Run clearAllMediaEverywhere() to delete ALL media and start fresh');

/**
 * Diagnostic: Check what's actually in R2 cloud storage
 */
async function diagnoseMediaLibrary() {
    console.log('🔍 Diagnosing media library...\n');
    
    // Check API
    try {
        const response = await fetch('/api/media?limit=100');
        const data = await response.json();
        
        console.log('📊 Cloud Database (D1):');
        console.log(`   Total items: ${data.media?.length || 0}`);
        
        if (data.media && data.media.length > 0) {
            console.log('\n   First 3 items:');
            data.media.slice(0, 3).forEach((item, i) => {
                console.log(`   ${i+1}. ${item.original_filename || item.filename}`);
                console.log(`      URL: ${item.r2_url || item.url}`);
                console.log(`      R2 Key: ${item.r2_key}`);
            });
            
            // Test if first image URL works
            const testUrl = data.media[0].r2_url || data.media[0].url;
            console.log(`\n🧪 Testing first image URL: ${testUrl}`);
            
            const imgTest = await fetch(testUrl);
            if (imgTest.ok) {
                console.log('   ✅ Image loads correctly!');
            } else {
                console.log(`   ❌ Image failed to load: ${imgTest.status}`);
            }
        }
    } catch (error) {
        console.error('❌ API Error:', error);
    }
    
    // Check localStorage
    const localMedia = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    console.log(`\n📦 localStorage: ${localMedia.length} items`);
    
    console.log('\n💡 If cloud has items but localStorage is empty, run:');
    console.log('   await loadMediaFromCloud()');
}

window.diagnoseMediaLibrary = diagnoseMediaLibrary;
