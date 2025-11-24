/**
 * Media File Preload
 * Prepopulates localStorage with base64 encoded images to ensure media appears properly without changing other functionality
 */

(function() {
    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', init);
    window.addEventListener('load', init);
    
    let initialized = false;
    
    function init() {
        if (initialized) return;
        initialized = true;
        
        console.log('Media File Preload: Initializing');
        
        // Preload media items
        preloadMediaItems();
    }
    
    function preloadMediaItems() {
        // Check if media is already loaded
        if (localStorage.getItem('fooodis_media_items_loaded') === 'true') {
            console.log('Media File Preload: Media already loaded');
            return;
        }
        
        // Base64 encoded image data - these will be displayed directly without needing to load external files
        // This is a small transparent PNG that will be shown and styled by CSS
        const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyJpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoV2luZG93cykiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6QkEyMjYxQjI0RDZDMTFFQTlCRkE5ODg5RjVCQUEzRDMiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6QkEyMjYxQjM0RDZDMTFFQTlCRkE5ODg5RjVCQUEzRDMiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDpCQTIyNjFCMDRENkMxMUVBOUJGQTk4ODlGNUJBQTNEMyIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDpCQTIyNjFCMTRENkMxMUVBOUJGQTk4ODlGNUJBQTNEMyIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/Pj6Vc2kAAAGAUExURQAAAP///wEBAf7+/v39/fz8/Pv7+/r6+vn5+fj4+Pf39/b29vX19fT09PPz8/Ly8vHx8fDw8O/v7+7u7u3t7ezs7Ovr6+rq6unp6ejo6Ofn5+bm5uXl5eTk5OPj4+Li4uHh4eDg4N/f397e3t3d3dzc3Nvb29ra2tnZ2djY2NfX19bW1tXV1dTU1NPT09LS0tHR0dDQ0M/Pz87Ozs3NzczMzMvLy8rKysnJycjIyMfHx8bGxsXFxcTExMPDw8LCwsHBwcDAwL+/v76+vr29vby8vLu7u7q6urm5ubi4uLe3t7a2trW1tbS0tLOzs7KysrGxsbCwsK+vr66urq2traysrKurq6qqqqmpqaioqKenp6ampqWlpaSkpKOjo6KioqGhoaCgoJ+fn56enp2dnZycnJubm5qampmZmZiYmJeXl5aWlpWVlZSUlJOTk5KSkpGRkZCQkI+Pj46Ojo2NjYyMjIuLi4qKiomJiYiIiIeHh4aGhoWFhYSEhIODg4KCgoGBgYCAgH9/f35+fn19fXx8fHt7e3p6enl5eXh4eHd3d3Z2dnV1dXR0dHNzc3JycnFxcXBwcG9vb25ubm1tbWxsbGtra2pqamlpaWhoaGdnZ2ZmZv///xQS2skAAAABdFJOUwBA5thmAAAAvklEQVR42uzVMQ6AIBREQQqt3NULqqVH9z/Ngj9qYUXWTvJeNSEjZVkAAAAAAAAAAAAAAAAAAAAAAAAAgK9UrTnq2cppZ8Y75MZ3ybzH73H6n67p+bL2HwAAANjPEAAAAAAAAOAYzdJuLQAAAAAAADwwDgEAAAB8Zhi/DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACAlwIMAI6WCWftSZPQAAAAAElFTkSuQmCC';
        
        // Create pre-loaded media items
        const mediaItems = [
            { id: '1', name: 'cappuccino-or-latte-coffee-with-heart-art.jpg', folder: 'food', type: 'image', url: 'images/media/cappuccino-or-latte-coffee-with-heart-art.jpg', dataUrl: imageData },
            { id: '2', name: 'japanese-tea-2024-04-08-18-06-00-utc.jpg', folder: 'food', type: 'image', url: 'images/media/japanese-tea-2024-04-08-18-06-00-utc.jpg', dataUrl: imageData },
            { id: '3', name: 'white-cup-of-tasty-cappuccino.jpg', folder: 'food', type: 'image', url: 'images/media/white-cup-of-tasty-cappuccino.jpg', dataUrl: imageData },
            { id: '4', name: 'hot-coffee-latte-art-on-wooden-table.jpg', folder: 'food', type: 'image', url: 'images/media/hot-coffee-latte-art-on-wooden-table.jpg', dataUrl: imageData },
            { id: '5', name: 'appetizing-soup-served-with-herbs.jpg', folder: 'food', type: 'image', url: 'images/media/appetizing-soup-served-with-herbs.jpg', dataUrl: imageData },
            { id: '6', name: 'restaurant-interior.jpg', folder: 'restaurant', type: 'image', url: 'images/media/restaurant-interior.jpg', dataUrl: imageData },
            { id: '7', name: 'chef-cooking.jpg', folder: 'people', type: 'image', url: 'images/media/chef-cooking.jpg', dataUrl: imageData },
            { id: '8', name: 'chef-decorating.jpg', folder: 'people', type: 'image', url: 'images/media/chef-decorating.jpg', dataUrl: imageData },
            { id: '9', name: 'a-full-bag-of-brown-coffee-beans.jpg', folder: 'food', type: 'image', url: 'images/media/a-full-bag-of-brown-coffee-beans.jpg', dataUrl: imageData }
        ];
        
        // Save to localStorage
        try {
            localStorage.setItem('fooodis_media_items', JSON.stringify(mediaItems));
            localStorage.setItem('fooodis_media_items_loaded', 'true');
            console.log('Media File Preload: Successfully loaded media items');
        } catch(e) {
            console.error('Media File Preload: Failed to load media items', e);
        }
    }
})();
