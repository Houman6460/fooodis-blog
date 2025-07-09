
// Enhanced Banner Fixed - Improved banner management system
class EnhancedBannerFixed {
    constructor() {
        this.banners = [];
        this.currentBanner = null;
        this.animationDuration = 300;
        this.initialize();
    }

    initialize() {
        console.log('Enhanced Banner Fixed: Initializing...');
        this.loadBanners();
        this.setupBannerContainer();
        this.startBannerRotation();
    }

    loadBanners() {
        try {
            const saved = localStorage.getItem('enhancedBanners');
            if (saved) {
                this.banners = JSON.parse(saved);
            } else {
                this.banners = this.getDefaultBanners();
            }
            console.log('Enhanced Banner Fixed: Loaded', this.banners.length, 'banners');
        } catch (error) {
            console.error('Enhanced Banner Fixed: Error loading banners:', error);
            this.banners = this.getDefaultBanners();
        }
    }

    getDefaultBanners() {
        return [
            {
                id: 'welcome',
                title: 'Welcome to Fooodis',
                message: 'Discover amazing food experiences with our AI-powered recommendations!',
                type: 'info',
                duration: 5000
            },
            {
                id: 'automation',
                title: 'AI Automation Active',
                message: 'Your automated content generation is working behind the scenes.',
                type: 'success',
                duration: 4000
            }
        ];
    }

    setupBannerContainer() {
        let container = document.getElementById('enhanced-banner-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'enhanced-banner-container';
            container.className = 'enhanced-banner-container';
            container.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                z-index: 9999;
                display: none;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 12px 20px;
                text-align: center;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                transition: all ${this.animationDuration}ms ease;
            `;
            document.body.appendChild(container);
        }
        this.container = container;
    }

    showBanner(banner) {
        if (!banner || !this.container) return;

        this.currentBanner = banner;
        this.container.innerHTML = `
            <div class="banner-content" style="display: flex; align-items: center; justify-content: space-between; max-width: 1200px; margin: 0 auto;">
                <div class="banner-text">
                    <strong>${banner.title}</strong>
                    <span style="margin-left: 10px;">${banner.message}</span>
                </div>
                <button class="banner-close" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0 5px;" onclick="window.enhancedBannerFixed.hideBanner()">×</button>
            </div>
        `;

        // Set banner type styling
        this.setBannerType(banner.type);

        // Show banner with animation
        this.container.style.display = 'block';
        setTimeout(() => {
            this.container.style.transform = 'translateY(0)';
            this.container.style.opacity = '1';
        }, 10);

        // Auto-hide after duration
        if (banner.duration) {
            setTimeout(() => {
                this.hideBanner();
            }, banner.duration);
        }

        console.log('Enhanced Banner Fixed: Showing banner:', banner.title);
    }

    setBannerType(type) {
        const colors = {
            info: 'linear-gradient(45deg, #2196F3, #1976D2)',
            success: 'linear-gradient(45deg, #4CAF50, #45a049)',
            warning: 'linear-gradient(45deg, #FF9800, #F57C00)',
            error: 'linear-gradient(45deg, #f44336, #d32f2f)'
        };

        this.container.style.background = colors[type] || colors.info;
    }

    hideBanner() {
        if (!this.container) return;

        this.container.style.transform = 'translateY(-100%)';
        this.container.style.opacity = '0';

        setTimeout(() => {
            this.container.style.display = 'none';
            this.currentBanner = null;
        }, this.animationDuration);

        console.log('Enhanced Banner Fixed: Banner hidden');
    }

    startBannerRotation() {
        if (this.banners.length === 0) return;

        let currentIndex = 0;
        const showNextBanner = () => {
            if (this.banners.length > 0) {
                this.showBanner(this.banners[currentIndex]);
                currentIndex = (currentIndex + 1) % this.banners.length;
            }
        };

        // Show first banner after 2 seconds
        setTimeout(showNextBanner, 2000);

        // Rotate banners every 10 seconds
        setInterval(() => {
            if (!this.currentBanner) {
                showNextBanner();
            }
        }, 10000);
    }

    addBanner(banner) {
        if (banner && banner.title && banner.message) {
            banner.id = banner.id || 'banner_' + Date.now();
            this.banners.push(banner);
            this.saveBanners();
            console.log('Enhanced Banner Fixed: Banner added:', banner.title);
        }
    }

    removeBanner(bannerId) {
        this.banners = this.banners.filter(b => b.id !== bannerId);
        this.saveBanners();
        console.log('Enhanced Banner Fixed: Banner removed:', bannerId);
    }

    saveBanners() {
        try {
            localStorage.setItem('enhancedBanners', JSON.stringify(this.banners));
        } catch (error) {
            console.error('Enhanced Banner Fixed: Error saving banners:', error);
        }
    }

    showCustomBanner(title, message, type = 'info', duration = 5000) {
        const banner = { title, message, type, duration };
        this.showBanner(banner);
    }
}

// Initialize enhanced banner system
window.enhancedBannerFixed = new EnhancedBannerFixed();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EnhancedBannerFixed;
}
