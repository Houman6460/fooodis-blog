/**
 * Profile Management System
 * Central manager for user profile with D1/R2 backend integration
 * 
 * Provides:
 * - Profile information management
 * - Avatar upload to R2
 * - Password change
 * - Preferences management
 * - Activity tracking
 * 
 * Integrates with:
 * - Profile Management section
 * - Blog Posts (author name)
 * - Dashboard header (avatar display)
 */

class ProfileManager {
    constructor() {
        this.profile = null;
        this.initialized = false;
        this.avatarPreviewUrl = null;
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }
    
    async init() {
        if (this.initialized) return;
        console.log('ProfileManager: Initializing...');
        
        // Load profile from API
        await this.loadProfile();
        
        // Setup UI
        this.setupUI();
        
        // Setup event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('ProfileManager: Initialized');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('profileReady', {
            detail: { profile: this.profile }
        }));
    }
    
    // ========================================
    // PROFILE OPERATIONS
    // ========================================
    
    /**
     * Load profile from D1 API
     */
    async loadProfile() {
        try {
            const response = await fetch('/api/profile');
            if (response.ok) {
                this.profile = await response.json();
                
                // Cache in localStorage
                localStorage.setItem('profile_data', JSON.stringify(this.profile));
                
                console.log('ProfileManager: Profile loaded from API');
                
                // Update UI
                this.updateUI();
                
                return this.profile;
            }
        } catch (error) {
            console.error('ProfileManager: Error loading profile', error);
        }
        
        // Fallback to localStorage
        try {
            const cached = localStorage.getItem('profile_data');
            if (cached) {
                this.profile = JSON.parse(cached);
                this.updateUI();
            }
        } catch (e) {
            this.profile = this.getDefaultProfile();
        }
        
        return this.profile;
    }
    
    /**
     * Update profile information
     */
    async updateProfile(updates) {
        console.log('ProfileManager: Updating profile', updates);
        
        try {
            const response = await fetch('/api/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            
            if (response.ok) {
                const result = await response.json();
                this.profile = result.profile;
                
                // Update localStorage
                localStorage.setItem('profile_data', JSON.stringify(this.profile));
                
                // Update UI
                this.updateUI();
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('profileUpdated', {
                    detail: { profile: this.profile }
                }));
                
                this.showNotification('Profile updated successfully!', 'success');
                return this.profile;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to update profile');
            }
        } catch (error) {
            console.error('ProfileManager: Error updating profile', error);
            this.showNotification('Error updating profile: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // AVATAR OPERATIONS
    // ========================================
    
    /**
     * Upload new avatar
     */
    async uploadAvatar(file) {
        console.log('ProfileManager: Uploading avatar', file.name);
        
        // Validate file
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showNotification('Invalid file type. Please use JPEG, PNG, GIF, or WebP.', 'error');
            throw new Error('Invalid file type');
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('File too large. Maximum size is 5MB.', 'error');
            throw new Error('File too large');
        }
        
        try {
            const formData = new FormData();
            formData.append('avatar', file);
            
            // Show loading state
            this.showAvatarLoading(true);
            
            const response = await fetch('/api/profile/avatar', {
                method: 'POST',
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update profile
                this.profile.avatar_url = result.avatar_url;
                localStorage.setItem('profile_data', JSON.stringify(this.profile));
                
                // Update UI
                this.updateAvatarDisplay(result.avatar_url);
                
                // Dispatch event
                document.dispatchEvent(new CustomEvent('avatarUpdated', {
                    detail: { avatar_url: result.avatar_url }
                }));
                
                this.showNotification('Avatar updated successfully!', 'success');
                return result.avatar_url;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to upload avatar');
            }
        } catch (error) {
            console.error('ProfileManager: Error uploading avatar', error);
            this.showNotification('Error uploading avatar: ' + error.message, 'error');
            throw error;
        } finally {
            this.showAvatarLoading(false);
        }
    }
    
    /**
     * Remove avatar
     */
    async removeAvatar() {
        console.log('ProfileManager: Removing avatar');
        
        try {
            const response = await fetch('/api/profile/avatar', {
                method: 'DELETE'
            });
            
            if (response.ok) {
                // Update profile
                this.profile.avatar_url = null;
                localStorage.setItem('profile_data', JSON.stringify(this.profile));
                
                // Update UI
                this.updateAvatarDisplay(null);
                
                document.dispatchEvent(new CustomEvent('avatarRemoved'));
                
                this.showNotification('Avatar removed', 'success');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to remove avatar');
            }
        } catch (error) {
            console.error('ProfileManager: Error removing avatar', error);
            this.showNotification('Error removing avatar: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // PASSWORD OPERATIONS
    // ========================================
    
    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword, confirmPassword) {
        console.log('ProfileManager: Changing password');
        
        // Validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            this.showNotification('All password fields are required', 'error');
            throw new Error('Missing required fields');
        }
        
        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            throw new Error('Passwords do not match');
        }
        
        if (newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters', 'error');
            throw new Error('Password too short');
        }
        
        try {
            const response = await fetch('/api/profile/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });
            
            if (response.ok) {
                // Clear password fields
                this.clearPasswordFields();
                
                document.dispatchEvent(new CustomEvent('passwordChanged'));
                
                this.showNotification('Password changed successfully!', 'success');
                return true;
            } else {
                const error = await response.json();
                throw new Error(error.error || 'Failed to change password');
            }
        } catch (error) {
            console.error('ProfileManager: Error changing password', error);
            this.showNotification('Error: ' + error.message, 'error');
            throw error;
        }
    }
    
    // ========================================
    // UI METHODS
    // ========================================
    
    /**
     * Setup UI components
     */
    setupUI() {
        this.updateUI();
    }
    
    /**
     * Update all UI elements with profile data
     */
    updateUI() {
        console.log('ProfileManager: updateUI called, profile:', this.profile);
        if (!this.profile) {
            console.log('ProfileManager: No profile data, skipping UI update');
            return;
        }
        
        // Update form fields
        this.setFieldValue('profile-name', this.profile.display_name);
        this.setFieldValue('profile-email', this.profile.email);
        this.setFieldValue('profile-role', this.profile.role);
        this.setFieldValue('profile-bio', this.profile.bio);
        
        // Update display name in header/sidebar
        document.querySelectorAll('.profile-display-name, .profile-info h2').forEach(el => {
            el.textContent = this.profile.display_name || 'Admin User';
        });
        
        // Update email displays
        document.querySelectorAll('.profile-email-display').forEach(el => {
            el.textContent = this.profile.email || '';
        });
        
        // Update role displays
        document.querySelectorAll('.profile-role-display').forEach(el => {
            el.textContent = this.profile.role || 'Administrator';
        });
        
        // Update avatar
        this.updateAvatarDisplay(this.profile.avatar_url);
        
        // Update initials
        this.updateInitials();
        
        // Update social links
        if (this.profile.social_links) {
            Object.entries(this.profile.social_links).forEach(([platform, url]) => {
                this.setFieldValue(`social-${platform}`, url);
            });
        }
    }
    
    /**
     * Set field value safely
     */
    setFieldValue(id, value) {
        const field = document.getElementById(id);
        if (field) {
            field.value = value || '';
        }
    }
    
    /**
     * Update avatar display elements
     */
    updateAvatarDisplay(avatarUrl) {
        console.log('ProfileManager: updateAvatarDisplay called with:', avatarUrl);
        const avatarImages = document.querySelectorAll('.profile-avatar-img, .avatar-image, #avatar-preview, .header-avatar-img');
        const avatarContainers = document.querySelectorAll('.profile-avatar, .avatar-container, .header-avatar');
        
        console.log('ProfileManager: Found avatar images:', avatarImages.length);
        console.log('ProfileManager: Found avatar containers:', avatarContainers.length);
        
        avatarImages.forEach(img => {
            if (avatarUrl) {
                img.src = avatarUrl;
                img.style.display = 'block';
            } else {
                img.style.display = 'none';
            }
        });
        
        avatarContainers.forEach(container => {
            if (avatarUrl) {
                container.classList.add('has-image');
                container.classList.remove('no-image');
            } else {
                container.classList.remove('has-image');
                container.classList.add('no-image');
            }
        });
        
        // Show/hide initials based on avatar
        document.querySelectorAll('.avatar-initials, .header-avatar-initials').forEach(el => {
            el.style.display = avatarUrl ? 'none' : 'flex';
        });
    }
    
    /**
     * Update initials displays
     */
    updateInitials() {
        const name = this.profile?.display_name || 'Admin User';
        const initials = name
            .split(' ')
            .filter(part => part.length > 0)
            .map(part => part.charAt(0))
            .join('')
            .substring(0, 2)
            .toUpperCase();
        
        document.querySelectorAll('.avatar-initials, .header-avatar-initials').forEach(el => {
            el.textContent = initials;
        });
    }
    
    /**
     * Show avatar loading state
     */
    showAvatarLoading(loading) {
        const containers = document.querySelectorAll('.profile-avatar, .avatar-container');
        containers.forEach(container => {
            if (loading) {
                container.classList.add('loading');
            } else {
                container.classList.remove('loading');
            }
        });
    }
    
    /**
     * Clear password fields
     */
    clearPasswordFields() {
        ['current-password', 'new-password', 'confirm-password'].forEach(id => {
            const field = document.getElementById(id);
            if (field) field.value = '';
        });
    }
    
    // ========================================
    // EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Profile form save
        const saveBtn = document.getElementById('save-profile');
        if (saveBtn) {
            saveBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handleProfileSave();
            });
        }
        
        // Avatar upload
        const avatarInput = document.getElementById('avatar-upload');
        const changeAvatarBtn = document.getElementById('change-avatar');
        
        if (changeAvatarBtn && avatarInput) {
            changeAvatarBtn.addEventListener('click', () => {
                avatarInput.click();
            });
            
            avatarInput.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files[0]) {
                    await this.uploadAvatar(e.target.files[0]);
                }
            });
        }
        
        // Remove avatar button
        const removeAvatarBtn = document.getElementById('remove-avatar');
        if (removeAvatarBtn) {
            removeAvatarBtn.addEventListener('click', async () => {
                if (confirm('Are you sure you want to remove your avatar?')) {
                    await this.removeAvatar();
                }
            });
        }
        
        // Password change
        const changePasswordBtn = document.getElementById('change-password');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await this.handlePasswordChange();
            });
        }
        
        // Tab navigation
        const navItems = document.querySelectorAll('.profile-nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleTabChange(item);
            });
        });
        
        // Name input change for initials
        const nameInput = document.getElementById('profile-name');
        if (nameInput) {
            nameInput.addEventListener('input', () => {
                this.profile.display_name = nameInput.value;
                this.updateInitials();
            });
        }
        
        // Drag and drop avatar
        this.setupAvatarDragDrop();
    }
    
    /**
     * Handle profile save
     */
    async handleProfileSave() {
        const updates = {
            display_name: document.getElementById('profile-name')?.value,
            email: document.getElementById('profile-email')?.value,
            role: document.getElementById('profile-role')?.value,
            bio: document.getElementById('profile-bio')?.value
        };
        
        // Collect social links
        const socialLinks = {};
        ['twitter', 'facebook', 'instagram', 'linkedin', 'website'].forEach(platform => {
            const value = document.getElementById(`social-${platform}`)?.value;
            if (value) socialLinks[platform] = value;
        });
        
        if (Object.keys(socialLinks).length > 0) {
            updates.social_links = socialLinks;
        }
        
        await this.updateProfile(updates);
    }
    
    /**
     * Handle password change
     */
    async handlePasswordChange() {
        const currentPassword = document.getElementById('current-password')?.value;
        const newPassword = document.getElementById('new-password')?.value;
        const confirmPassword = document.getElementById('confirm-password')?.value;
        
        await this.changePassword(currentPassword, newPassword, confirmPassword);
    }
    
    /**
     * Handle tab change
     */
    handleTabChange(item) {
        const navItems = document.querySelectorAll('.profile-nav-item');
        const sections = document.querySelectorAll('.profile-section');
        
        // Update nav items
        navItems.forEach(navItem => navItem.classList.remove('active'));
        item.classList.add('active');
        
        // Update sections
        sections.forEach(section => section.classList.remove('active'));
        
        const target = item.getAttribute('href')?.substring(1);
        const targetSection = document.getElementById(target + '-section');
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }
    
    /**
     * Setup drag and drop for avatar
     */
    setupAvatarDragDrop() {
        const dropZone = document.querySelector('.profile-avatar, .avatar-container');
        if (!dropZone) return;
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('drag-over');
        });
        
        dropZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                await this.uploadAvatar(e.dataTransfer.files[0]);
            }
        });
    }
    
    // ========================================
    // UTILITY METHODS
    // ========================================
    
    /**
     * Get default profile
     */
    getDefaultProfile() {
        return {
            user_id: 'admin',
            display_name: 'Admin User',
            email: 'admin@fooodis.com',
            role: 'Administrator',
            bio: '',
            avatar_url: null,
            social_links: {},
            preferences: {
                theme: 'dark',
                notifications: true
            }
        };
    }
    
    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        if (typeof showNotification === 'function') {
            showNotification(message, type);
        } else {
            console.log(`[${type}] ${message}`);
            if (type === 'error') {
                alert(message);
            }
        }
    }
    
    /**
     * Get current profile
     */
    getProfile() {
        return this.profile;
    }
    
    /**
     * Get display name
     */
    getDisplayName() {
        return this.profile?.display_name || 'Admin User';
    }
    
    /**
     * Get avatar URL
     */
    getAvatarUrl() {
        return this.profile?.avatar_url;
    }
}

// Initialize and expose globally
window.profileManager = new ProfileManager();
window.ProfileManager = ProfileManager;
