/**
 * Folder Icons
 * Provides a collection of icons for folder management
 */

// Array of available folder icons
const folderIcons = [
    { id: 'folder', name: 'Default Folder' },
    { id: 'folder-open', name: 'Open Folder' },
    { id: 'utensils', name: 'Food' },
    { id: 'hamburger', name: 'Burger' },
    { id: 'pizza-slice', name: 'Pizza' },
    { id: 'coffee', name: 'Coffee' },
    { id: 'wine-glass-alt', name: 'Drinks' },
    { id: 'store', name: 'Restaurant' },
    { id: 'shopping-bag', name: 'Shopping' },
    { id: 'users', name: 'People' },
    { id: 'user-friends', name: 'Friends' },
    { id: 'user-tie', name: 'Staff' },
    { id: 'camera', name: 'Camera' },
    { id: 'image', name: 'Images' },
    { id: 'video', name: 'Videos' },
    { id: 'film', name: 'Film' },
    { id: 'calendar', name: 'Calendar' },
    { id: 'calendar-alt', name: 'Events' },
    { id: 'star', name: 'Favorites' },
    { id: 'heart', name: 'Loved' },
    { id: 'thumbs-up', name: 'Approved' },
    { id: 'award', name: 'Award' },
    { id: 'certificate', name: 'Certificate' },
    { id: 'trophy', name: 'Trophy' },
    { id: 'tag', name: 'Tag' },
    { id: 'tags', name: 'Tags' },
    { id: 'bookmark', name: 'Bookmark' },
    { id: 'flag', name: 'Flag' },
    { id: 'map-marker-alt', name: 'Location' },
    { id: 'map', name: 'Map' },
    { id: 'globe', name: 'Global' },
    { id: 'building', name: 'Building' },
    { id: 'home', name: 'Home' },
    { id: 'truck', name: 'Delivery' },
    { id: 'shipping-fast', name: 'Fast Delivery' },
    { id: 'box', name: 'Package' },
    { id: 'boxes', name: 'Packages' },
    { id: 'archive', name: 'Archive' },
    { id: 'clipboard', name: 'Clipboard' },
    { id: 'clipboard-list', name: 'List' },
    { id: 'clipboard-check', name: 'Checklist' },
    { id: 'tasks', name: 'Tasks' },
    { id: 'check-square', name: 'Completed' },
    { id: 'file', name: 'File' },
    { id: 'file-alt', name: 'Document' },
    { id: 'file-image', name: 'Image File' },
    { id: 'file-video', name: 'Video File' },
    { id: 'file-audio', name: 'Audio File' },
    { id: 'file-pdf', name: 'PDF' },
    { id: 'file-word', name: 'Word' },
    { id: 'file-excel', name: 'Excel' },
    { id: 'file-powerpoint', name: 'PowerPoint' },
    { id: 'file-code', name: 'Code' },
    { id: 'file-contract', name: 'Contract' },
    { id: 'file-signature', name: 'Signature' },
    { id: 'file-invoice', name: 'Invoice' },
    { id: 'file-invoice-dollar', name: 'Invoice with Dollar' },
    { id: 'money-bill-wave', name: 'Money' },
    { id: 'dollar-sign', name: 'Dollar' },
    { id: 'euro-sign', name: 'Euro' },
    { id: 'pound-sign', name: 'Pound' },
    { id: 'yen-sign', name: 'Yen' },
    { id: 'credit-card', name: 'Credit Card' },
    { id: 'receipt', name: 'Receipt' },
    { id: 'chart-bar', name: 'Bar Chart' },
    { id: 'chart-line', name: 'Line Chart' },
    { id: 'chart-pie', name: 'Pie Chart' },
    { id: 'chart-area', name: 'Area Chart' },
    { id: 'analytics', name: 'Analytics' },
    { id: 'percentage', name: 'Percentage' },
    { id: 'project-diagram', name: 'Project' },
    { id: 'sitemap', name: 'Sitemap' },
    { id: 'network-wired', name: 'Network' },
    { id: 'server', name: 'Server' },
    { id: 'database', name: 'Database' },
    { id: 'hdd', name: 'Storage' },
    { id: 'save', name: 'Save' },
    { id: 'cloud', name: 'Cloud' },
    { id: 'cloud-upload-alt', name: 'Cloud Upload' },
    { id: 'cloud-download-alt', name: 'Cloud Download' },
    { id: 'desktop', name: 'Desktop' },
    { id: 'laptop', name: 'Laptop' },
    { id: 'mobile-alt', name: 'Mobile' },
    { id: 'tablet-alt', name: 'Tablet' },
    { id: 'tv', name: 'TV' },
    { id: 'plug', name: 'Plug' },
    { id: 'lightbulb', name: 'Idea' },
    { id: 'brain', name: 'Brain' },
    { id: 'graduation-cap', name: 'Education' },
    { id: 'book', name: 'Book' },
    { id: 'books', name: 'Books' },
    { id: 'newspaper', name: 'News' },
    { id: 'envelope', name: 'Mail' },
    { id: 'comment', name: 'Comment' },
    { id: 'comments', name: 'Comments' },
    { id: 'phone', name: 'Phone' },
    { id: 'headset', name: 'Support' },
    { id: 'handshake', name: 'Deal' },
    { id: 'hands-helping', name: 'Help' },
    { id: 'hand-holding-heart', name: 'Charity' },
    { id: 'hand-holding-usd', name: 'Donation' },
    { id: 'hand-holding-medical', name: 'Medical Help' },
    { id: 'medkit', name: 'Medical Kit' },
    { id: 'first-aid', name: 'First Aid' },
    { id: 'hospital', name: 'Hospital' },
    { id: 'stethoscope', name: 'Doctor' },
    { id: 'user-md', name: 'Medical Professional' },
    { id: 'heartbeat', name: 'Health' },
    { id: 'dumbbell', name: 'Fitness' },
    { id: 'running', name: 'Running' },
    { id: 'biking', name: 'Biking' },
    { id: 'swimming-pool', name: 'Swimming' },
    { id: 'spa', name: 'Spa' },
    { id: 'umbrella-beach', name: 'Beach' },
    { id: 'mountain', name: 'Mountain' },
    { id: 'tree', name: 'Nature' },
    { id: 'leaf', name: 'Leaf' },
    { id: 'seedling', name: 'Plant' },
    { id: 'dog', name: 'Dog' },
    { id: 'cat', name: 'Cat' },
    { id: 'horse', name: 'Horse' },
    { id: 'fish', name: 'Fish' },
    { id: 'paw', name: 'Pet' },
    { id: 'car', name: 'Car' },
    { id: 'bicycle', name: 'Bicycle' },
    { id: 'motorcycle', name: 'Motorcycle' },
    { id: 'bus', name: 'Bus' },
    { id: 'train', name: 'Train' },
    { id: 'plane', name: 'Plane' },
    { id: 'ship', name: 'Ship' },
    { id: 'anchor', name: 'Anchor' },
    { id: 'compass', name: 'Compass' },
    { id: 'route', name: 'Route' },
    { id: 'road', name: 'Road' },
    { id: 'gas-pump', name: 'Gas Station' },
    { id: 'charging-station', name: 'Charging Station' },
    { id: 'traffic-light', name: 'Traffic Light' },
    { id: 'hotel', name: 'Hotel' },
    { id: 'concierge-bell', name: 'Service' },
    { id: 'key', name: 'Key' },
    { id: 'door-open', name: 'Open Door' },
    { id: 'door-closed', name: 'Closed Door' },
    { id: 'couch', name: 'Furniture' },
    { id: 'chair', name: 'Chair' },
    { id: 'bed', name: 'Bed' },
    { id: 'bath', name: 'Bath' },
    { id: 'shower', name: 'Shower' },
    { id: 'toilet', name: 'Toilet' },
    { id: 'sink', name: 'Sink' },
    { id: 'faucet', name: 'Faucet' },
    { id: 'trash', name: 'Trash' },
    { id: 'recycle', name: 'Recycle' },
    { id: 'broom', name: 'Cleaning' },
    { id: 'soap', name: 'Soap' },
    { id: 'pump-soap', name: 'Pump Soap' },
    { id: 'spray-can', name: 'Spray' },
    { id: 'brush', name: 'Brush' },
    { id: 'paint-roller', name: 'Paint' },
    { id: 'palette', name: 'Art' },
    { id: 'music', name: 'Music' },
    { id: 'guitar', name: 'Guitar' },
    { id: 'drum', name: 'Drum' },
    { id: 'headphones', name: 'Headphones' },
    { id: 'microphone', name: 'Microphone' },
    { id: 'podcast', name: 'Podcast' },
    { id: 'photo-video', name: 'Media' },
    { id: 'camera-retro', name: 'Retro Camera' },
    { id: 'film', name: 'Film' },
    { id: 'gamepad', name: 'Gaming' },
    { id: 'dice', name: 'Dice' },
    { id: 'chess', name: 'Chess' },
    { id: 'football-ball', name: 'Football' },
    { id: 'basketball-ball', name: 'Basketball' },
    { id: 'baseball-ball', name: 'Baseball' },
    { id: 'volleyball-ball', name: 'Volleyball' },
    { id: 'hockey-puck', name: 'Hockey' },
    { id: 'table-tennis', name: 'Table Tennis' },
    { id: 'bowling-ball', name: 'Bowling' },
    { id: 'golf-ball', name: 'Golf' },
    { id: 'futbol', name: 'Soccer' },
    { id: 'quidditch', name: 'Quidditch' },
    { id: 'snowboarding', name: 'Snowboarding' },
    { id: 'skiing', name: 'Skiing' },
    { id: 'skating', name: 'Skating' },
    { id: 'swimmer', name: 'Swimmer' },
    { id: 'hiking', name: 'Hiking' },
    { id: 'tshirt', name: 'Clothing' },
    { id: 'socks', name: 'Socks' },
    { id: 'shoe-prints', name: 'Shoes' },
    { id: 'hat-cowboy', name: 'Hat' },
    { id: 'glasses', name: 'Glasses' },
    { id: 'ring', name: 'Jewelry' },
    { id: 'gem', name: 'Gem' },
    { id: 'gift', name: 'Gift' },
    { id: 'birthday-cake', name: 'Birthday' },
    { id: 'candy-cane', name: 'Candy' },
    { id: 'cookie', name: 'Cookie' },
    { id: 'ice-cream', name: 'Ice Cream' },
    { id: 'cocktail', name: 'Cocktail' },
    { id: 'glass-martini-alt', name: 'Martini' },
    { id: 'glass-whiskey', name: 'Whiskey' },
    { id: 'beer', name: 'Beer' },
    { id: 'wine-bottle', name: 'Wine Bottle' },
    { id: 'wine-glass', name: 'Wine Glass' },
    { id: 'mug-hot', name: 'Hot Drink' },
    { id: 'coffee', name: 'Coffee' },
    { id: 'egg', name: 'Egg' },
    { id: 'bacon', name: 'Bacon' },
    { id: 'hamburger', name: 'Hamburger' },
    { id: 'hotdog', name: 'Hot Dog' },
    { id: 'pizza-slice', name: 'Pizza' },
    { id: 'bread-slice', name: 'Bread' },
    { id: 'cheese', name: 'Cheese' },
    { id: 'apple-alt', name: 'Apple' },
    { id: 'lemon', name: 'Lemon' },
    { id: 'carrot', name: 'Carrot' },
    { id: 'pepper-hot', name: 'Hot Pepper' },
    { id: 'drumstick-bite', name: 'Chicken' },
    { id: 'fish', name: 'Fish' },
    { id: 'bone', name: 'Bone' },
    { id: 'cookie', name: 'Cookie' },
    { id: 'candy-cane', name: 'Candy' },
    { id: 'birthday-cake', name: 'Cake' }
];

/**
 * Get all available folder icons
 * @returns {Array} Array of folder icon objects
 */
function getFolderIcons() {
    return folderIcons;
}

/**
 * Show icon picker dialog
 * @param {Function} onSelect - Callback function when an icon is selected
 */
function showIconPicker(onSelect) {
    // Remove any existing icon picker
    const existingPicker = document.getElementById('folderIconPicker');
    if (existingPicker) {
        existingPicker.remove();
    }
    
    // Create icon picker container
    const iconPicker = document.createElement('div');
    iconPicker.id = 'folderIconPicker';
    iconPicker.className = 'folder-icon-picker';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Select Folder Icon';
    title.style.marginTop = '0';
    title.style.marginBottom = '15px';
    title.style.textAlign = 'center';
    title.style.color = '#e8f24c'; // Yellow accent color to match dashboard theme
    title.style.fontWeight = 'bold';
    
    // Add search input
    const searchContainer = document.createElement('div');
    searchContainer.className = 'icon-search-container';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search icons...';
    searchInput.className = 'icon-search-input';
    
    const searchIcon = document.createElement('i');
    searchIcon.className = 'fas fa-search';
    
    searchContainer.appendChild(searchInput);
    searchContainer.appendChild(searchIcon);
    
    // Create icons grid
    const iconsGrid = document.createElement('div');
    iconsGrid.className = 'icons-grid';
    
    // Add icons to grid
    folderIcons.forEach(icon => {
        const iconItem = document.createElement('div');
        iconItem.className = 'icon-item';
        iconItem.dataset.icon = icon.id;
        iconItem.title = icon.name;
        
        const iconElement = document.createElement('i');
        iconElement.className = `fas fa-${icon.id}`;
        
        iconItem.appendChild(iconElement);
        
        // Add click event
        iconItem.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent event bubbling
            
            // Call onSelect callback with selected icon
            if (typeof onSelect === 'function') {
                onSelect(icon.id);
            }
            
            // Close icon picker
            iconPicker.remove();
        });
        
        iconsGrid.appendChild(iconItem);
    });
    
    // Add search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase();
        
        // Filter icons
        const iconItems = iconsGrid.querySelectorAll('.icon-item');
        
        iconItems.forEach(item => {
            const iconId = item.dataset.icon;
            const iconName = folderIcons.find(icon => icon.id === iconId)?.name.toLowerCase() || '';
            
            if (iconId.includes(searchTerm) || iconName.includes(searchTerm)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    });
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'icon-picker-close';
    closeButton.innerHTML = '<i class="fas fa-times"></i>';
    closeButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent event bubbling
        iconPicker.remove();
    });
    
    // Assemble icon picker
    iconPicker.appendChild(closeButton);
    iconPicker.appendChild(title);
    iconPicker.appendChild(searchContainer);
    iconPicker.appendChild(iconsGrid);
    
    // Add to body
    document.body.appendChild(iconPicker);
    
    // Focus search input
    setTimeout(() => {
        searchInput.focus();
    }, 100);
    
    // Create a backdrop to prevent clicks outside from closing the picker too early
    const backdrop = document.createElement('div');
    backdrop.style.position = 'fixed';
    backdrop.style.top = '0';
    backdrop.style.left = '0';
    backdrop.style.width = '100%';
    backdrop.style.height = '100%';
    backdrop.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    backdrop.style.zIndex = '9998';
    backdrop.id = 'icon-picker-backdrop';
    backdrop.style.backdropFilter = 'blur(2px)';
    
    // Add click event to backdrop to close picker
    backdrop.addEventListener('click', function() {
        iconPicker.remove();
        backdrop.remove();
    });
    
    // Insert backdrop before icon picker
    document.body.insertBefore(backdrop, iconPicker);
    
    // Set icon picker z-index higher than backdrop
    iconPicker.style.zIndex = '9999';
    
    // Position in center of screen
    iconPicker.style.top = '50%';
    iconPicker.style.left = '50%';
    iconPicker.style.transform = 'translate(-50%, -50%)';
}
