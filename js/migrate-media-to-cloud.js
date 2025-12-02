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
