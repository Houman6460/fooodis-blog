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

// Override deleteMediaItem to also delete from cloud
window.deleteMediaItem = async function(id) {
    console.log('🗑️ Deleting media item:', id);
    
    // First, try to delete from cloud API
    try {
        const response = await fetch(`/api/media/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            console.log('✅ Deleted from cloud');
        } else {
            console.warn('⚠️ Cloud delete failed, trying to continue...');
        }
    } catch (error) {
        console.error('❌ Cloud delete error:', error);
    }
    
    // Also remove from localStorage
    let mediaLibrary = JSON.parse(localStorage.getItem('fooodis-blog-media') || '[]');
    const itemIndex = mediaLibrary.findIndex(item => item.id === id);
    
    if (itemIndex !== -1) {
        mediaLibrary.splice(itemIndex, 1);
        localStorage.setItem('fooodis-blog-media', JSON.stringify(mediaLibrary));
    }
    
    // Refresh display
    if (typeof filterMedia === 'function') {
        filterMedia();
    } else if (typeof renderMediaLibrary === 'function') {
        renderMediaLibrary();
    }
    
    if (typeof showNotification === 'function') {
        showNotification('Media item deleted', 'success');
    }
};

console.log('☁️ Cloud Delete Fix: Ready - deletes will now remove from R2');
