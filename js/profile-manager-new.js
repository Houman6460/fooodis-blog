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
window.addEventListener('load', function() {
    console.log('Profile Manager: Loading...');
    initProfileSection();
});

// Backup initialization for when DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Profile Manager: DOM ready');
    initProfileSection();
});

/**
 * Initialize the profile section functionality
 */
function initProfileSection() {
    // Check if profile section exists on this page
    if (!document.querySelector('.profile-container')) {
        console.log('Profile Manager: No profile container found');
        return;
    }
    
    console.log('Profile Manager: Initializing...');
    setupTabNavigation();
    setupProfileForm();
    setupPasswordForm();
    setupAvatarUpload();
    generateAvatarInitials();
    console.log('Profile Manager: Initialization complete');
}

/**
 * Setup tab navigation for profile/security tabs
 */
function setupTabNavigation() {
    console.log('Setting up tab navigation');
    const navItems = document.querySelectorAll('.profile-nav-item');
    const sections = document.querySelectorAll('.profile-section');
    
    console.log('Found', navItems.length, 'navigation items and', sections.length, 'sections');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Tab clicked:', this.getAttribute('href'));
            
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Hide all sections
            sections.forEach(section => section.classList.remove('active'));
            
            // Show the corresponding section
            const target = this.getAttribute('href').substring(1); // Remove # from href
            const targetSection = document.getElementById(target + '-section');
            
            if (targetSection) {
                targetSection.classList.add('active');
                console.log('Activated section:', target + '-section');
            } else {
                console.error('Target section not found:', target + '-section');
            }
        });
    });
}

/**
 * Setup profile form submission
 */
function setupProfileForm() {
    console.log('Setting up profile form');
    const saveButton = document.getElementById('save-profile');
    const nameInput = document.getElementById('profile-name');
    
    if (saveButton && nameInput) {
        console.log('Profile form elements found');
        
        // Add data to localStorage if not already there
        if (!localStorage.getItem('profile_data')) {
            const defaultData = {
                name: nameInput.value || 'Admin User',
                email: document.getElementById('profile-email').value || 'admin@fooodis.com',
                role: document.getElementById('profile-role').value || 'Administrator'
            };
            localStorage.setItem('profile_data', JSON.stringify(defaultData));
        }
        
        // Load existing data
        try {
            const profileData = JSON.parse(localStorage.getItem('profile_data'));
            if (profileData) {
                nameInput.value = profileData.name || 'Admin User';
                
                const emailInput = document.getElementById('profile-email');
                if (emailInput) emailInput.value = profileData.email || 'admin@fooodis.com';
                
                const roleInput = document.getElementById('profile-role');
                if (roleInput) roleInput.value = profileData.role || 'Administrator';
                
                // Update UI display
                const nameDisplays = document.querySelectorAll('.profile-info h2');
                nameDisplays.forEach(el => el.textContent = profileData.name);
                
                const emailDisplays = document.querySelectorAll('.profile-info p:first-of-type');
                emailDisplays.forEach(el => el.textContent = profileData.email);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
        }
        
        // Set up save button action
        saveButton.addEventListener('click', function() {
            const name = nameInput.value;
            const email = document.getElementById('profile-email').value;
            const role = document.getElementById('profile-role').value;
            
            try {
                // Save to localStorage
                const profileData = {
                    name: name,
                    email: email,
                    role: role
                };
                localStorage.setItem('profile_data', JSON.stringify(profileData));
                
                // Update UI display
                const nameDisplays = document.querySelectorAll('.profile-info h2');
                nameDisplays.forEach(el => el.textContent = name);
                
                const emailDisplays = document.querySelectorAll('.profile-info p:first-of-type');
                emailDisplays.forEach(el => el.textContent = email);
                
                // Update avatar initials
                generateAvatarInitials();
                
                console.log('Profile saved successfully');
                alert('Profile information updated successfully!');
            } catch (error) {
                console.error('Error saving profile data:', error);
                alert('There was an error saving your profile information.');
            }
        });
    } else {
        console.error('Profile form elements not found');
    }
}

/**
 * Setup password change form submission
 */
function setupPasswordForm() {
    console.log('Setting up password form');
    const changePasswordBtn = document.getElementById('change-password');
    const currentPasswordInput = document.getElementById('current-password');
    const newPasswordInput = document.getElementById('new-password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    
    if (changePasswordBtn && currentPasswordInput && newPasswordInput && confirmPasswordInput) {
        console.log('Password form elements found');
        
        // Set up change password button action
        changePasswordBtn.addEventListener('click', function() {
            console.log('Change password clicked');
            const currentPassword = currentPasswordInput.value;
            const newPassword = newPasswordInput.value;
            const confirmPassword = confirmPasswordInput.value;
            
            // Basic validation
            if (!currentPassword || !newPassword || !confirmPassword) {
                console.log('Password validation failed: Empty fields');
                alert('All password fields are required.');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                console.log('Password validation failed: Passwords do not match');
                alert('New passwords do not match.');
                return;
            }
            
            // For demo, we'll check if current password is 'password' or empty
            // In a real app, this would check against stored password
            if (currentPassword !== 'password' && localStorage.getItem('demo_password') !== null && 
                currentPassword !== localStorage.getItem('demo_password')) {
                console.log('Password validation failed: Incorrect current password');
                alert('Current password is incorrect.');
                return;
            }
            
            try {
                // Save new password - in a real app this would be hashed and sent to server
                localStorage.setItem('demo_password', newPassword);
                
                console.log('Password updated successfully');
                alert('Password updated successfully!');
                
                // Clear the form
                currentPasswordInput.value = '';
                newPasswordInput.value = '';
                confirmPasswordInput.value = '';
                
                // Switch back to profile tab
                const profileNavItem = document.querySelector('.profile-nav-item[href="#profile"]');
                if (profileNavItem) {
                    profileNavItem.click();
                }
            } catch (error) {
                console.error('Error updating password:', error);
                alert('There was an error updating your password.');
            }
        });
    } else {
        console.error('Password form elements not found');
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
    console.log('Generating avatar initials');
    const avatarElements = document.querySelectorAll('.avatar-initials');
    const nameInput = document.getElementById('profile-name');
    
    if (avatarElements.length && nameInput) {
        console.log('Found avatar elements and name input');
        
        // Function to update initials
        const updateInitials = function() {
            // Get name from input or localStorage
            let name = nameInput.value || 'Admin User';
            try {
                const profileData = JSON.parse(localStorage.getItem('profile_data'));
                if (profileData && profileData.name) {
                    name = profileData.name;
                    // Also update name input if needed
                    if (nameInput.value !== name) {
                        nameInput.value = name;
                    }
                }
            } catch (error) {
                console.error('Error reading profile data for initials:', error);
            }
            
            // Generate initials
            const initials = name.split(' ')
                .filter(part => part.length > 0) // Filter out empty parts
                .map(part => part.charAt(0))
                .join('')
                .substring(0, 2)
                .toUpperCase();
            
            console.log('Generated initials:', initials);
                
            // Update all avatar initials
            avatarElements.forEach(el => {
                el.textContent = initials;
                console.log('Updated avatar element with initials');
            });
        };
        
        // Set initial value
        updateInitials();
        
        // Update when name changes
        nameInput.addEventListener('input', updateInitials);
        
        // Also update when profile data changes in localStorage
        window.addEventListener('storage', function(e) {
            if (e.key === 'profile_data') {
                updateInitials();
            }
        });
    } else {
        console.error('Avatar elements or name input not found');
    }
}
