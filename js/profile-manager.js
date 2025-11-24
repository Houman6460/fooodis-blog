/**
 * Profile Manager - Handles profile-related functionality
 * 
 * This script manages the profile section in the dashboard including:
 * - Navigation between profile tabs
 * - Updating profile information
 * - Handling password changes
 * - Profile image uploads
 */

// Execute when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    initProfileSection();
});

/**
 * Initialize the profile section functionality
 */
function initProfileSection() {
    setupTabNavigation();
    setupProfileForm();
    setupPasswordForm();
    setupAvatarUpload();
    generateAvatarInitials();
}

/**
 * Setup tab navigation for profile/security tabs
 */
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.profile-nav-item');
    const sections = document.querySelectorAll('.profile-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show the corresponding section
            const target = this.getAttribute('href').substring(1);
            document.getElementById(target + '-section').classList.add('active');
        });
    });
}

/**
 * Setup profile form submission
 */
function setupProfileForm() {
    const saveButton = document.getElementById('save-profile');
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            const name = document.getElementById('profile-name').value;
            const email = document.getElementById('profile-email').value;
            const role = document.getElementById('profile-role').value;
            
            // In a real app, we would save this to the server
            // For demo purposes, we'll just show a success message
            alert('Profile information updated successfully!');
        });
    }
}

/**
 * Setup password change form submission
 */
function setupPasswordForm() {
    const changePasswordBtn = document.getElementById('change-password');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', function() {
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Basic validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                alert('All password fields are required.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                alert('New passwords do not match.');
                return;
            }
            
            // In a real app, we would verify the current password and update to the new one
            // For demo purposes, we'll just show a success message
            alert('Password updated successfully!');
            
            // Clear the form
            document.getElementById('current-password').value = '';
            document.getElementById('new-password').value = '';
            document.getElementById('confirm-password').value = '';
        });
    }
}

/**
 * Setup avatar upload functionality
 */
function setupAvatarUpload() {
    const changeAvatarBtn = document.getElementById('change-avatar');
    const fileInput = document.getElementById('avatar-upload');
    
    if (changeAvatarBtn && fileInput) {
        changeAvatarBtn.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function() {
            if (this.files && this.files[0]) {
                // In a real app, we would upload this file to a server
                // For demo purposes, we'll just show a success message
                alert('Profile picture updated successfully!');
            }
        });
    }
}

/**
 * Generate avatar initials from user name
 */
function generateAvatarInitials() {
    const avatarElements = document.querySelectorAll('.avatar-initials');
    const nameInput = document.getElementById('profile-name');
    
    if (avatarElements.length && nameInput) {
        const updateInitials = function() {
            const name = nameInput.value || 'User Name';
            const initials = name.split(' ')
                .map(part => part.charAt(0))
                .join('')
                .substring(0, 2)
                .toUpperCase();
                
            avatarElements.forEach(el => el.textContent = initials);
        };
        
        // Set initial value
        updateInitials();
        
        // Update when name changes
        nameInput.addEventListener('input', updateInitials);
    }
}

// Use a self-executing function to avoid variable collisions
(function() {
    // Check if the profile section exists and initialize when the DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Profile Manager: Checking for profile section');
        // Initialize profile section functionality if on dashboard page
        if (document.getElementById('profile-section')) {
            console.log('Profile Manager: Profile section found, initializing...');
            initProfileManager();
        }
    });
    
    // Also try when window is fully loaded (backup)
    window.addEventListener('load', function() {
        if (document.getElementById('profile-section') && !window.profileManagerInitialized) {
            console.log('Profile Manager: Initializing on window load');
            initProfileManager();
        }
    });

/**
 * Initialize the profile manager functionality
 */
function initProfileManager() {
    console.log('Initializing Profile Manager...');
    
    // Load mock profile data (would be replaced with actual API calls in production)
    loadProfileData();
    
    // Initialize form event listeners
    initProfileForms();
    
    // Initialize tabs
    initProfileTabs();
    
    // Initialize profile image upload
    initProfileImageUpload();
}

/**
 * Load profile data from storage or set defaults
 */
function loadProfileData() {
    // Get stored profile data or set defaults
    const defaultAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAACXBIWXMAAAsTAAALEwEAmpwYAAAF8WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDpbeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS42LWMxNDggNzkuMTY0MDM2LCAyMDE5LzA4LzEzLTAxOjA2OjU3ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgMjAxOSAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDUtMDdUMjA6MDA6NDQrMDI6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTA1LTA3VDIwOjAxOjIwKzAyOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTA1LTA3VDIwOjAxOjIwKzAyOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDowNjdlMGUxMi0yYTJmLTQ0ZmYtOTI4Yi01NjYwNzJiODM5ZTAiIHhtcE1NOkRvY3Vt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';
    
    // Get stored profile data or set defaults
    const profileData = JSON.parse(localStorage.getItem('profile_data')) || {
        name: 'Admin User',
        email: 'admin@fooodis.com',
        role: 'Administrator',
        avatarUrl: defaultAvatar
    };
    
    // Update UI with profile data
    document.getElementById('profileNameDisplay').textContent = profileData.name;
    document.getElementById('profileEmailDisplay').textContent = profileData.email;
    document.getElementById('profileRoleDisplay').textContent = profileData.role;
    
    // Set form values
    document.getElementById('profileName').value = profileData.name;
    document.getElementById('profileEmail').value = profileData.email;
    document.getElementById('profileRole').value = profileData.role;
    
    // Update avatar images
    const avatarElements = document.querySelectorAll('.profile-avatar');
    avatarElements.forEach(avatar => {
        if (!avatar.querySelector('img')) {
            const img = document.createElement('img');
            img.src = profileData.avatarUrl;
            img.alt = 'Profile Avatar';
            img.className = 'avatar-image';
            avatar.appendChild(img);
        }
    });
}

/**
 * Initialize profile form event listeners
 */
function initProfileForms() {
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('profileName').value;
            const email = document.getElementById('profileEmail').value;
            const role = document.getElementById('profileRole').value;
            
            // Get current profile data
            const profileData = JSON.parse(localStorage.getItem('profile_data')) || {};
            
            // Update profile data
            profileData.name = name;
            profileData.email = email;
            profileData.role = role;
            
            // Save updated profile data
            localStorage.setItem('profile_data', JSON.stringify(profileData));
            
            // Update UI
            document.getElementById('profileNameDisplay').textContent = name;
            document.getElementById('profileEmailDisplay').textContent = email;
            document.getElementById('profileRoleDisplay').textContent = role;
            
            // Show success message
            const statusElement = document.getElementById('profileStatus');
            statusElement.textContent = 'Profile updated successfully!';
            statusElement.className = 'alert alert-success profile-status';
            
            // Hide success message after 3 seconds
            setTimeout(() => {
                statusElement.textContent = '';
                statusElement.className = 'alert profile-status';
            }, 3000);
        });
    }
    
    // Password form submission
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate passwords
            const statusElement = document.getElementById('passwordStatus');
            
            if (!currentPassword || !newPassword || !confirmPassword) {
                statusElement.textContent = 'All fields are required.';
                statusElement.className = 'alert alert-danger password-status';
                return;
            }
            
            if (newPassword !== confirmPassword) {
                statusElement.textContent = 'New passwords do not match.';
                statusElement.className = 'alert alert-danger password-status';
                return;
            }
            
            // Mock password check (would be handled securely on server)
            if (currentPassword === 'password') {
                // Password changed successfully
                statusElement.textContent = 'Password updated successfully!';
                statusElement.className = 'alert alert-success password-status';
                
                // Reset form
                passwordForm.reset();
                
                // Hide success message after 3 seconds
                setTimeout(() => {
                    statusElement.textContent = '';
                    statusElement.className = 'alert password-status';
                }, 3000);
            } else {
                // Incorrect current password
                statusElement.textContent = 'Current password is incorrect.';
                statusElement.className = 'alert alert-danger password-status';
            }
        });
    }
}

/**
 * Initialize profile tabs
 */
function initProfileTabs() {
    const tabButtons = document.querySelectorAll('#profileTabs button, #profileTabs .nav-link');
    const tabPanes = document.querySelectorAll('#profileTabsContent .tab-pane');
    
    // Handle tab clicks
    tabButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
                btn.setAttribute('aria-selected', 'false');
            });
            
            // Hide all tab panes
            tabPanes.forEach(pane => {
                pane.classList.remove('show', 'active');
            });
            
            // Add active class to clicked tab
            this.classList.add('active');
            this.setAttribute('aria-selected', 'true');
            
            // Get target ID from data-bs-target or data-target (to support both Bootstrap 5 and 4)
            let targetId = this.getAttribute('data-bs-target') || this.getAttribute('data-target');
            
            // If target ID is not found, try href attribute (for older Bootstrap versions)
            if (!targetId) {
                targetId = this.getAttribute('href');
            }
            
            // Extract ID without # if it exists
            if (targetId) {
                targetId = targetId.replace('#', '');
            } else {
                // Fallback to use button id without -tab suffix
                targetId = this.id.replace('-tab', '');
            }
            
            // Show corresponding tab pane
            const targetPane = document.getElementById(targetId);
            if (targetPane) {
                targetPane.classList.add('show', 'active');
            }
        });
    });
}

/**
 * Initialize profile image upload
 */
function initProfileImageUpload() {
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                // Only process image files
                if (!file.type.match('image.*')) {
                    alert('Please select an image file.');
                    return;
                }
                
                // Create file reader to display preview
                const reader = new FileReader();
                reader.onload = function(e) {
                    // Get current profile data
                    const profileData = JSON.parse(localStorage.getItem('profile_data')) || {};
                    
                    // Update avatar URL
                    profileData.avatarUrl = e.target.result;
                    
                    // Save updated profile data
                    localStorage.setItem('profile_data', JSON.stringify(profileData));
                    
                    // Update all avatar images
                    const avatarImages = document.querySelectorAll('.profile-avatar img');
                    avatarImages.forEach(img => {
                        img.src = e.target.result;
                    });
                };
                
                // Read the image file as a data URL
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Set initialization flag
    window.profileManagerInitialized = true;
})();
