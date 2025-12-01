/**
 * Media Library Manager
 * Central manager for media files with D1/R2 backend integration
 * 
 * Provides cross-module synchronization between:
 * - Media Library section
 * - Create New Blog Post (featured image selection)
 * - AI Content Automation (media folder selection)
 * - Email Templates (image insertion)
 */

class MediaLibraryManager {
    constructor() {
        this.media = [];
        this.folders = [];
        this.selectedMedia = null;
        this.currentFolder = 'all';
        this.pagination = { total: 0, limit: 50, offset: 0 };
        this.initialized = false;
        this.uploadCallbacks = new Map();
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.initialized) return;
        console.log('MediaLibraryManager: Initializing...');
        
        // Load data from API
        await this.loadFolders();
        await this.loadMedia();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('MediaLibraryManager: Initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('mediaLibraryReady', {
            detail: { media: this.media, folders: this.folders }
        }));
    }
    
    // ========================================
    // MEDIA OPERATIONS
    // ========================================
    
    /**
     * Load media files from D1 API
     */
    async loadMedia(options = {}) {
        const folder = options.folder || this.currentFolder;
        const limit = options.limit || this.pagination.limit;
        const offset = options.offset || 0;
        
        try {
            let url = `/api/media?limit=${limit}&offset=${offset}`;
            if (folder && folder !== 'all') {
                url += `&folder=${encodeURIComponent(folder)}`;
            }
            
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                this.media = data.media || [];
                this.pagination = data.pagination || { total: 0, limit, offset };
                
                // Cache in localStorage
                localStorage.setItem('fooodis-media-library', JSON.stringify({
                    media: this.media,
                    timestamp: Date.now()
                }));
                
                console.log(`MediaLibraryManager: Loaded ${this.media.length} media files`);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('mediaLoaded', {
                    detail: { media: this.media, pagination: this.pagination }
                }));
                
                return this.media;
            }
        } catch (error) {
            console.error('MediaLibraryManager: Error loading media', error);
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem('fooodis-media-library');
            if (cached) {
                const data = JSON.parse(cached);
                this.media = data.media || [];
            }
        } catch (e) {
            this.media = [];
        }
        
        return this.media;
    }
    
    /**
     * Load folders from D1/R2 API
     */
    async loadFolders() {
        try {
            const response = await fetch('/api/media/folders');
            if (response.ok) {
                this.folders = await response.json();
                console.log(`MediaLibraryManager: Loaded ${this.folders.length} folders`);
                return this.folders;
            }
        } catch (error) {
            console.error('MediaLibraryManager: Error loading folders', error);
        }
        
        // Default folders
        this.folders = [
            { name: 'all', display_name: 'All Media', file_count: 0 },
            { name: 'uploads', display_name: 'Uploads', file_count: 0 },
            { name: 'blog-images', display_name: 'Blog Images', file_count: 0 },
            { name: 'ai-generated', display_name: 'AI Generated', file_count: 0 }
        ];
        
        return this.folders;
    }
    
    /**
     * Upload a file to R2 storage
     * @param {File} file - The file to upload
     * @param {Object} options - Upload options (folder, alt_text, caption, post_id)
     */
    async uploadFile(file, options = {}) {
        console.log('MediaLibraryManager: Uploading file', file.name);
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('folder', options.folder || 'uploads');
        if (options.alt_text) formData.append('alt_text', options.alt_text);
        if (options.caption) formData.append('caption', options.caption);
        if (options.post_id) formData.append('post_id', options.post_id);
        
        try {
            // Dispatch upload started event
            document.dispatchEvent(new CustomEvent('mediaUploadStarted', {
                detail: { file: file.name, size: file.size }
            }));
            
            const response = await fetch('/api/media', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Add to local array
                this.media.unshift(result.media);
                
                // Update folder count
                const folder = this.folders.find(f => f.name === result.media.folder);
                if (folder) folder.file_count++;
                
                // Dispatch events
                document.dispatchEvent(new CustomEvent('mediaUploaded', {
                    detail: { media: result.media }
                }));
                
                // Call any registered callbacks
                this.uploadCallbacks.forEach(callback => {
                    try { callback(result.media); } catch (e) { console.error(e); }
                });
                
                return result.media;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Upload failed');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Upload error', error);
            
            document.dispatchEvent(new CustomEvent('mediaUploadFailed', {
                detail: { file: file.name, error: error.message }
            }));
            
            throw error;
        }
    }
    
    /**
     * Upload multiple files
     */
    async uploadFiles(files, options = {}) {
        const results = [];
        const errors = [];
        
        for (const file of files) {
            try {
                const media = await this.uploadFile(file, options);
                results.push(media);
            } catch (error) {
                errors.push({ file: file.name, error: error.message });
            }
        }
        
        document.dispatchEvent(new CustomEvent('mediaBatchUploadComplete', {
            detail: { uploaded: results, errors }
        }));
        
        return { uploaded: results, errors };
    }
    
    /**
     * Update media metadata
     */
    async updateMedia(mediaId, updates) {
        console.log('MediaLibraryManager: Updating media', mediaId);
        
        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local array
                const index = this.media.findIndex(m => m.id === mediaId);
                if (index !== -1) {
                    this.media[index] = result.media;
                }
                
                document.dispatchEvent(new CustomEvent('mediaUpdated', {
                    detail: { media: result.media }
                }));
                
                return result.media;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Update failed');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Update error', error);
            throw error;
        }
    }
    
    /**
     * Delete a media file
     */
    async deleteMedia(mediaId) {
        console.log('MediaLibraryManager: Deleting media', mediaId);
        
        const media = this.media.find(m => m.id === mediaId);
        if (!media) {
            throw new Error('Media not found');
        }
        
        try {
            const response = await fetch(`/api/media/${mediaId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                this.media = this.media.filter(m => m.id !== mediaId);
                
                // Update folder count
                const folder = this.folders.find(f => f.name === media.folder);
                if (folder && folder.file_count > 0) folder.file_count--;
                
                document.dispatchEvent(new CustomEvent('mediaDeleted', {
                    detail: { mediaId, folder: media.folder }
                }));
                
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Delete failed');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Delete error', error);
            throw error;
        }
    }
    
    /**
     * Delete multiple media files
     */
    async deleteMediaBatch(mediaIds) {
        const results = [];
        const errors = [];
        
        for (const id of mediaIds) {
            try {
                await this.deleteMedia(id);
                results.push(id);
            } catch (error) {
                errors.push({ id, error: error.message });
            }
        }
        
        return { deleted: results, errors };
    }
    
    // ========================================
    // FOLDER OPERATIONS
    // ========================================
    
    /**
     * Create a new folder
     */
    async createFolder(name, description = '') {
        console.log('MediaLibraryManager: Creating folder', name);
        
        try {
            const response = await fetch('/api/media/folders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Add to local array
                this.folders.push({
                    name: result.folder.name,
                    display_name: result.folder.name,
                    file_count: 0
                });
                
                document.dispatchEvent(new CustomEvent('mediaFolderCreated', {
                    detail: { folder: result.folder }
                }));
                
                return result.folder;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create folder');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Folder creation error', error);
            throw error;
        }
    }
    
    /**
     * Rename a folder
     */
    async renameFolder(oldName, newName, newDisplayName = null) {
        console.log('MediaLibraryManager: Renaming folder', oldName, 'to', newName);
        
        try {
            const response = await fetch('/api/media/folders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: oldName,
                    new_name: newName,
                    new_display_name: newDisplayName || newName
                })
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local folder array
                const folderIndex = this.folders.findIndex(f => f.name === oldName);
                if (folderIndex !== -1) {
                    this.folders[folderIndex].name = result.new_name;
                    this.folders[folderIndex].display_name = result.display_name;
                }
                
                // Update media items with old folder name
                this.media.forEach(m => {
                    if (m.folder === oldName) {
                        m.folder = result.new_name;
                    }
                });
                
                document.dispatchEvent(new CustomEvent('mediaFolderRenamed', {
                    detail: { 
                        oldName: oldName,
                        newName: result.new_name,
                        displayName: result.display_name
                    }
                }));
                
                return result;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to rename folder');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Folder rename error', error);
            throw error;
        }
    }
    
    /**
     * Delete a folder (files moved to uploads)
     */
    async deleteFolder(folderName) {
        console.log('MediaLibraryManager: Deleting folder', folderName);
        
        try {
            const response = await fetch(`/api/media/folders?name=${encodeURIComponent(folderName)}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Remove from local array
                this.folders = this.folders.filter(f => f.name !== folderName);
                
                // Update media items to 'uploads' folder
                this.media.forEach(m => {
                    if (m.folder === folderName) {
                        m.folder = 'uploads';
                    }
                });
                
                document.dispatchEvent(new CustomEvent('mediaFolderDeleted', {
                    detail: { folderName }
                }));
                
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete folder');
            }
        } catch (error) {
            console.error('MediaLibraryManager: Folder delete error', error);
            throw error;
        }
    }
    
    /**
     * Move media to a different folder
     */
    async moveToFolder(mediaId, targetFolder) {
        return await this.updateMedia(mediaId, { folder: targetFolder });
    }
    
    /**
     * Get media by folder
     */
    getMediaByFolder(folderName) {
        if (folderName === 'all') return this.media;
        return this.media.filter(m => m.folder === folderName);
    }
    
    // ========================================
    // SELECTION & PICKER
    // ========================================
    
    /**
     * Select media for use in other sections
     */
    selectMedia(mediaId) {
        this.selectedMedia = this.media.find(m => m.id === mediaId) || null;
        
        document.dispatchEvent(new CustomEvent('mediaSelected', {
            detail: { media: this.selectedMedia }
        }));
        
        return this.selectedMedia;
    }
    
    /**
     * Open media picker modal
     * @param {Object} options - Picker options
     * @returns {Promise<Object>} - Selected media
     */
    openPicker(options = {}) {
        return new Promise((resolve, reject) => {
            const config = {
                multiple: options.multiple || false,
                filter: options.filter || 'all', // 'all', 'image', 'video'
                folder: options.folder || null,
                onSelect: (media) => {
                    resolve(media);
                    this.closePicker();
                },
                onCancel: () => {
                    resolve(null);
                    this.closePicker();
                }
            };
            
            this._showPickerModal(config);
        });
    }
    
    /**
     * Show picker modal
     */
    _showPickerModal(config) {
        // Remove existing modal
        const existing = document.getElementById('media-picker-modal');
        if (existing) existing.remove();
        
        const modal = document.createElement('div');
        modal.id = 'media-picker-modal';
        modal.className = 'media-picker-modal active';
        modal.innerHTML = `
            <div class="media-picker-dialog">
                <div class="media-picker-header">
                    <h3>Select Media</h3>
                    <button type="button" class="close-btn">&times;</button>
                </div>
                <div class="media-picker-filters">
                    <select id="picker-folder-select">
                        <option value="all">All Folders</option>
                        ${this.folders.map(f => `<option value="${f.name}">${f.display_name || f.name} (${f.file_count || 0})</option>`).join('')}
                    </select>
                    <select id="picker-type-filter">
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="video">Videos</option>
                    </select>
                </div>
                <div class="media-picker-grid" id="picker-grid">
                    ${this._renderPickerGrid(config)}
                </div>
                <div class="media-picker-footer">
                    <button type="button" class="cancel-btn">Cancel</button>
                    <button type="button" class="select-btn" disabled>Select</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        this._addPickerStyles();
        
        // Event listeners
        let selectedMedia = null;
        
        modal.querySelector('.close-btn').onclick = () => config.onCancel();
        modal.querySelector('.cancel-btn').onclick = () => config.onCancel();
        
        modal.querySelector('.select-btn').onclick = () => {
            if (selectedMedia) config.onSelect(selectedMedia);
        };
        
        modal.querySelector('#picker-folder-select').onchange = (e) => {
            const grid = modal.querySelector('#picker-grid');
            grid.innerHTML = this._renderPickerGrid({ ...config, folder: e.target.value });
            this._attachGridListeners(modal, config, (media) => {
                selectedMedia = media;
                modal.querySelector('.select-btn').disabled = !media;
            });
        };
        
        modal.querySelector('#picker-type-filter').onchange = (e) => {
            const grid = modal.querySelector('#picker-grid');
            grid.innerHTML = this._renderPickerGrid({ ...config, filter: e.target.value });
            this._attachGridListeners(modal, config, (media) => {
                selectedMedia = media;
                modal.querySelector('.select-btn').disabled = !media;
            });
        };
        
        this._attachGridListeners(modal, config, (media) => {
            selectedMedia = media;
            modal.querySelector('.select-btn').disabled = !media;
        });
    }
    
    /**
     * Render picker grid
     */
    _renderPickerGrid(config) {
        let items = this.media;
        
        // Filter by folder
        if (config.folder && config.folder !== 'all') {
            items = items.filter(m => m.folder === config.folder);
        }
        
        // Filter by type
        if (config.filter === 'image') {
            items = items.filter(m => m.mime_type?.startsWith('image/'));
        } else if (config.filter === 'video') {
            items = items.filter(m => m.mime_type?.startsWith('video/'));
        }
        
        if (items.length === 0) {
            return '<div class="picker-empty">No media files found</div>';
        }
        
        return items.map(media => `
            <div class="picker-item" data-id="${media.id}">
                ${media.mime_type?.startsWith('image/') 
                    ? `<img src="${media.r2_url || media.url}" alt="${media.alt_text || media.filename}">`
                    : `<div class="video-placeholder"><i class="fas fa-video"></i></div>`
                }
                <div class="picker-item-name">${media.original_filename || media.filename}</div>
            </div>
        `).join('');
    }
    
    /**
     * Attach grid click listeners
     */
    _attachGridListeners(modal, config, onSelect) {
        modal.querySelectorAll('.picker-item').forEach(item => {
            item.onclick = () => {
                modal.querySelectorAll('.picker-item').forEach(i => i.classList.remove('selected'));
                item.classList.add('selected');
                const media = this.media.find(m => m.id === item.dataset.id);
                onSelect(media);
            };
            
            item.ondblclick = () => {
                const media = this.media.find(m => m.id === item.dataset.id);
                if (media) config.onSelect(media);
            };
        });
    }
    
    /**
     * Close picker modal
     */
    closePicker() {
        const modal = document.getElementById('media-picker-modal');
        if (modal) modal.remove();
    }
    
    /**
     * Add picker styles
     */
    _addPickerStyles() {
        if (document.getElementById('media-picker-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'media-picker-styles';
        style.textContent = `
            .media-picker-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                align-items: center;
                justify-content: center;
            }
            .media-picker-modal.active {
                display: flex;
            }
            .media-picker-dialog {
                background: #1e1e24;
                border-radius: 12px;
                width: 90%;
                max-width: 900px;
                max-height: 80vh;
                display: flex;
                flex-direction: column;
                color: #e0e0e0;
            }
            .media-picker-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 16px 20px;
                border-bottom: 1px solid #333;
            }
            .media-picker-header h3 {
                margin: 0;
                color: #cce62a;
            }
            .media-picker-header .close-btn {
                background: none;
                border: none;
                color: #888;
                font-size: 24px;
                cursor: pointer;
            }
            .media-picker-filters {
                padding: 12px 20px;
                display: flex;
                gap: 12px;
                border-bottom: 1px solid #333;
            }
            .media-picker-filters select {
                background: #252530;
                border: 1px solid #444;
                color: #e0e0e0;
                padding: 8px 12px;
                border-radius: 6px;
            }
            .media-picker-grid {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                gap: 12px;
            }
            .picker-item {
                border: 2px solid #333;
                border-radius: 8px;
                overflow: hidden;
                cursor: pointer;
                transition: all 0.2s;
            }
            .picker-item:hover {
                border-color: #478ac9;
            }
            .picker-item.selected {
                border-color: #cce62a;
            }
            .picker-item img {
                width: 100%;
                height: 100px;
                object-fit: cover;
            }
            .picker-item .video-placeholder {
                width: 100%;
                height: 100px;
                background: #252530;
                display: flex;
                align-items: center;
                justify-content: center;
                color: #888;
                font-size: 32px;
            }
            .picker-item-name {
                padding: 8px;
                font-size: 11px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .picker-empty {
                grid-column: 1 / -1;
                text-align: center;
                color: #888;
                padding: 40px;
            }
            .media-picker-footer {
                padding: 16px 20px;
                border-top: 1px solid #333;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            }
            .media-picker-footer button {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                cursor: pointer;
            }
            .media-picker-footer .cancel-btn {
                background: #444;
                color: #e0e0e0;
            }
            .media-picker-footer .select-btn {
                background: #cce62a;
                color: #1e1e24;
            }
            .media-picker-footer .select-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Get media by ID
     */
    getMediaById(id) {
        return this.media.find(m => m.id === id);
    }
    
    /**
     * Get media URL
     */
    getMediaUrl(mediaOrId) {
        const media = typeof mediaOrId === 'string' 
            ? this.getMediaById(mediaOrId) 
            : mediaOrId;
        return media?.r2_url || media?.url || null;
    }
    
    /**
     * Filter media by type
     */
    getImages() {
        return this.media.filter(m => m.mime_type?.startsWith('image/'));
    }
    
    getVideos() {
        return this.media.filter(m => m.mime_type?.startsWith('video/'));
    }
    
    /**
     * Search media
     */
    searchMedia(query) {
        const q = query.toLowerCase();
        return this.media.filter(m => 
            m.filename?.toLowerCase().includes(q) ||
            m.original_filename?.toLowerCase().includes(q) ||
            m.alt_text?.toLowerCase().includes(q) ||
            m.caption?.toLowerCase().includes(q)
        );
    }
    
    /**
     * Register upload callback
     */
    onUpload(callback) {
        const id = Date.now().toString();
        this.uploadCallbacks.set(id, callback);
        return () => this.uploadCallbacks.delete(id);
    }
    
    /**
     * Populate a folder dropdown
     */
    populateFolderDropdown(selectElement, options = {}) {
        if (!selectElement) return;
        
        const includeAll = options.includeAll !== false;
        const placeholder = options.placeholder || 'Select folder';
        
        selectElement.innerHTML = '';
        
        if (includeAll) {
            selectElement.innerHTML = `<option value="all">${placeholder}</option>`;
        }
        
        this.folders.forEach(folder => {
            if (folder.name === 'all') return;
            const option = document.createElement('option');
            option.value = folder.name;
            option.textContent = `${folder.display_name || folder.name} (${folder.file_count || 0})`;
            selectElement.appendChild(option);
        });
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Listen for AI automation needing media
        document.addEventListener('aiMediaRequested', async (e) => {
            const { folder, callback } = e.detail;
            const media = await this.loadMedia({ folder });
            if (callback) callback(media);
        });
        
        // Listen for post creation needing featured image
        document.addEventListener('postFeaturedImageRequested', async (e) => {
            const media = await this.openPicker({ filter: 'image' });
            if (media && e.detail.callback) {
                e.detail.callback(media);
            }
        });
    }
}

// Initialize and expose globally
window.mediaLibraryManager = new MediaLibraryManager();
window.MediaLibraryManager = MediaLibraryManager;
