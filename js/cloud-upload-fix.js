/**
 * Cloud Upload Fix - Override localStorage-based uploads with R2 cloud uploads
 * This file should be loaded AFTER dashboard-fixes-new.js
 */

(function() {
    console.log('☁️ Cloud Upload Fix: Initializing...');
    
    // Override the uploadMedia function to use cloud storage
    window.uploadMedia = async function(files) {
        console.log('📤 Cloud Upload: Uploading', files.length, 'files to R2...');
        
        const filesArray = Array.from(files);
        let successCount = 0;
        let failCount = 0;
        
        for (const file of filesArray) {
            if (!file.type.match('image.*') && !file.type.match('video.*')) {
                if (typeof showNotification === 'function') {
                    showNotification(`File "${file.name}" is not a valid media file`, 'error');
                }
                failCount++;
                continue;
            }
            
            try {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('folder', 'uploads');
                formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));
                
                console.log(`📤 Uploading "${file.name}" to R2...`);
                if (typeof showNotification === 'function') {
                    showNotification(`Uploading "${file.name}"...`, 'info');
                }
                
                const response = await fetch('/api/media', {
                    method: 'POST',
                    body: formData
                });
                
                if (response.ok) {
                    const result = await response.json();
                    console.log('✅ Uploaded to R2:', result.media?.r2_url || result.media?.url);
                    successCount++;
                } else {
                    const error = await response.json().catch(() => ({}));
                    console.error('❌ Upload failed:', error);
                    failCount++;
                }
            } catch (error) {
                console.error('❌ Upload error:', error);
                failCount++;
            }
        }
        
        // Show result
        if (successCount > 0) {
            if (typeof showNotification === 'function') {
                showNotification(`✅ ${successCount} file(s) uploaded to cloud!`, 'success');
            }
        }
        if (failCount > 0) {
            if (typeof showNotification === 'function') {
                showNotification(`❌ ${failCount} file(s) failed to upload`, 'error');
            }
        }
        
        // Reload media from cloud and refresh display
        console.log('🔄 Refreshing media library from cloud...');
        
        if (typeof loadMediaFromCloud === 'function') {
            await loadMediaFromCloud();
        }
        
        if (typeof filterMedia === 'function') {
            filterMedia();
        } else if (typeof renderMediaLibrary === 'function') {
            renderMediaLibrary();
        }
        
        console.log('✅ Cloud Upload: Complete');
    };
    
    // Also override uploadMediaToFolder to use the same logic
    window.uploadMediaToFolder = window.uploadMedia;
    
    console.log('☁️ Cloud Upload Fix: Ready - uploads will now go to R2');
})();
