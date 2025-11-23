
/**
 * Blog Banner Live Integration
 * Handles displaying the advertising banner on the live blog page
 */

class BlogBannerLive {
    constructor() {
        this.config = null;
        this.container = null;
        this.countdownInterval = null;
        
        this.init();
    }

    init() {
        // Load configuration
        this.loadConfig();
        
        // Create banner container if config exists and is enabled
        if (this.config && this.config.enabled) {
            this.createBannerContainer();
            this.renderBanner();
        }
        
        // Listen for updates from dashboard
        window.addEventListener('message', (event) => {
            if (event.data.type === 'BANNER_UPDATED') {
                this.config = event.data.config;
                this.updateBanner();
            }
        });
        
        // Check for updates periodically
        setInterval(() => {
            this.checkForUpdates();
        }, 5000);
    }

    loadConfig() {
        try {
            const saved = localStorage.getItem('live-advertising-banner');
            if (saved) {
                this.config = JSON.parse(saved);
                console.log('Live banner config loaded:', this.config);
            }
        } catch (error) {
            console.error('Error loading live banner config:', error);
        }
    }

    checkForUpdates() {
        const newConfigString = localStorage.getItem('live-advertising-banner');
        if (newConfigString && newConfigString !== JSON.stringify(this.config)) {
            try {
                this.config = JSON.parse(newConfigString);
                this.updateBanner();
            } catch (error) {
                console.error('Error parsing updated config:', error);
            }
        }
    }

    createBannerContainer() {
        // Remove existing container if it exists
        const existing = document.getElementById('live-advertising-banner');
        if (existing) {
            existing.remove();
        }

        // Create new container
        this.container = document.createElement('div');
        this.container.id = 'live-advertising-banner';
        this.container.className = 'live-banner-container';

        // Find insertion point (before footer or at end of main content)
        const footer = document.querySelector('footer, .footer, .fooodis-footer');
        const main = document.querySelector('main, .main-content, .blog-content-section');
        
        if (footer && footer.parentNode) {
            footer.parentNode.insertBefore(this.container, footer);
        } else if (main) {
            main.appendChild(this.container);
        } else {
            document.body.appendChild(this.container);
        }
    }

    renderBanner() {
        if (!this.container || !this.config || !this.config.enabled) {
            return;
        }

        const bannerHTML = this.generateBannerHTML();
        this.container.innerHTML = bannerHTML;

        // Initialize countdown if enabled
        if (this.config.countdown.enabled && this.config.countdown.endDate) {
            this.initializeCountdown();
        }

        // Add animations if enabled
        if (this.config.animation.enabled) {
            this.addAnimations();
        }

        console.log('Live banner rendered');
    }

    updateBanner() {
        if (!this.config || !this.config.enabled) {
            // Remove banner if disabled
            if (this.container) {
                this.container.remove();
                this.container = null;
            }
            return;
        }

        // Create container if it doesn't exist
        if (!this.container) {
            this.createBannerContainer();
        }

        this.renderBanner();
    }

    generateBannerHTML() {
        const styles = this.generateBannerStyles();
        
        return `
            <div class="live-advertising-banner" style="${styles}">
                <div class="live-banner-content layout-${this.config.layout}">
                    <div class="banner-text-section">
                        <h3 class="live-banner-title" style="color: ${this.config.design.titleColor}">
                            ${this.config.content.title || 'Special Offer'}
                        </h3>
                        <h4 class="live-banner-subtitle" style="color: ${this.config.design.textColor}">
                            ${this.config.content.subtitle || 'Limited Time Only'}
                        </h4>
                        ${this.config.countdown.enabled ? this.generateCountdownHTML() : ''}
                        <p class="live-banner-description" style="color: ${this.config.design.textColor}">
                            ${this.config.content.description || 'Don\'t miss out on this amazing offer!'}
                        </p>
                        ${this.config.button.enabled ? this.generateButtonHTML() : ''}
                    </div>
                    ${this.config.content.imageUrl ? `
                        <div class="banner-image-section">
                            <img src="${this.config.content.imageUrl}" alt="Banner Image" class="live-banner-image">
                        </div>
                    ` : ''}
                </div>
                <button class="live-banner-close" onclick="this.parentElement.parentElement.style.display='none'">
                    &times;
                </button>
            </div>
        `;
    }

    generateBannerStyles() {
        return `
            background-color: ${this.config.design.backgroundColor};
            border: ${this.config.design.borderWidth}px solid ${this.config.design.borderColor};
            border-radius: ${this.config.design.borderRadius}px;
            color: ${this.config.design.textColor};
            padding: 30px;
            margin: 40px auto;
            max-width: 1200px;
            position: relative;
            overflow: hidden;
        `;
    }

    generateCountdownHTML() {
        return `
            <div class="live-banner-countdown countdown-${this.config.countdown.style}" style="color: ${this.config.countdown.color}; margin: 20px 0;">
                <div class="countdown-container">
                    <div class="countdown-item">
                        <span class="countdown-number" id="live-countdown-days">00</span>
                        <span class="countdown-text">Days</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="live-countdown-hours">00</span>
                        <span class="countdown-text">Hours</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="live-countdown-minutes">00</span>
                        <span class="countdown-text">Minutes</span>
                    </div>
                    <div class="countdown-item">
                        <span class="countdown-number" id="live-countdown-seconds">00</span>
                        <span class="countdown-text">Seconds</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateButtonHTML() {
        return `
            <a href="${this.config.button.url}" 
               class="live-banner-button" 
               style="
                   background-color: ${this.config.button.backgroundColor};
                   color: ${this.config.button.textColor};
                   border-radius: ${this.config.button.radius}px;
                   padding: 12px 24px;
                   text-decoration: none;
                   display: inline-block;
                   margin-top: 20px;
                   font-weight: 600;
                   transition: all 0.3s ease;
                   border: none;
                   cursor: pointer;
               "
               ${this.config.button.url !== '#' ? 'target="_blank" rel="noopener"' : ''}>
                ${this.config.button.text}
            </a>
        `;
    }

    initializeCountdown() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        const endDate = new Date(this.config.countdown.endDate);
        
        const updateCountdown = () => {
            const now = new Date();
            const diff = endDate - now;

            if (diff <= 0) {
                document.querySelectorAll('#live-countdown-days, #live-countdown-hours, #live-countdown-minutes, #live-countdown-seconds').forEach(el => {
                    if (el) el.textContent = '00';
                });
                clearInterval(this.countdownInterval);
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            const daysEl = document.getElementById('live-countdown-days');
            const hoursEl = document.getElementById('live-countdown-hours');
            const minutesEl = document.getElementById('live-countdown-minutes');
            const secondsEl = document.getElementById('live-countdown-seconds');

            if (daysEl) daysEl.textContent = days.toString().padStart(2, '0');
            if (hoursEl) hoursEl.textContent = hours.toString().padStart(2, '0');
            if (minutesEl) minutesEl.textContent = minutes.toString().padStart(2, '0');
            if (secondsEl) secondsEl.textContent = seconds.toString().padStart(2, '0');
        };

        updateCountdown();
        this.countdownInterval = setInterval(updateCountdown, 1000);
    }

    addAnimations() {
        if (!this.container) return;

        const banner = this.container.querySelector('.live-advertising-banner');
        if (!banner) return;

        // Add animation class based on type
        banner.classList.add(`animate-${this.config.animation.type}`);
        banner.style.animationDuration = `${this.config.animation.duration}s`;

        // Add CSS for animations if not already present
        if (!document.getElementById('live-banner-animations')) {
            const style = document.createElement('style');
            style.id = 'live-banner-animations';
            style.textContent = `
                @keyframes animate-fade {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes animate-slide {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes animate-zoom {
                    from { opacity: 0; transform: scale(0.8); }
                    to { opacity: 1; transform: scale(1); }
                }
                @keyframes animate-bounce {
                    0% { opacity: 0; transform: translateY(-50px); }
                    60% { opacity: 1; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade { animation-name: animate-fade; }
                .animate-slide { animation-name: animate-slide; }
                .animate-zoom { animation-name: animate-zoom; }
                .animate-bounce { animation-name: animate-bounce; }
            `;
            document.head.appendChild(style);
        }
    }
}

// Add basic styles for the live banner
if (!document.getElementById('live-banner-styles')) {
    const style = document.createElement('style');
    style.id = 'live-banner-styles';
    style.textContent = `
        .live-banner-container {
            width: 100%;
            margin: 20px 0;
        }
        
        .live-advertising-banner {
            position: relative;
            animation-fill-mode: both;
        }
        
        .live-banner-content {
            display: flex;
            align-items: center;
            gap: 30px;
        }
        
        .live-banner-content.layout-horizontal {
            flex-direction: row;
        }
        
        .live-banner-content.layout-vertical {
            flex-direction: column;
            text-align: center;
        }
        
        .live-banner-content.layout-overlay {
            position: relative;
            justify-content: center;
            align-items: center;
            min-height: 200px;
        }
        
        .banner-text-section {
            flex: 1;
        }
        
        .banner-image-section {
            flex: 1;
            text-align: center;
        }
        
        .live-banner-title {
            font-size: 28px;
            font-weight: 700;
            margin: 0 0 10px 0;
        }
        
        .live-banner-subtitle {
            font-size: 18px;
            font-weight: 500;
            margin: 0 0 15px 0;
        }
        
        .live-banner-description {
            font-size: 16px;
            line-height: 1.5;
            margin: 15px 0;
        }
        
        .live-banner-image {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
        }
        
        .live-banner-close {
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.2);
            color: white;
            border: none;
            border-radius: 50%;
            width: 30px;
            height: 30px;
            cursor: pointer;
            font-size: 18px;
            line-height: 1;
        }
        
        .live-banner-close:hover {
            background: rgba(0, 0, 0, 0.4);
        }
        
        .live-banner-countdown {
            margin: 20px 0;
        }
        
        .countdown-container {
            display: flex;
            gap: 15px;
            justify-content: flex-start;
        }
        
        .countdown-item {
            text-align: center;
            background: rgba(0, 0, 0, 0.1);
            padding: 10px;
            border-radius: 5px;
            min-width: 60px;
        }
        
        .countdown-number {
            display: block;
            font-size: 24px;
            font-weight: bold;
        }
        
        .countdown-text {
            display: block;
            font-size: 12px;
            margin-top: 5px;
        }
        
        .live-banner-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        @media (max-width: 768px) {
            .live-banner-content {
                flex-direction: column;
                text-align: center;
            }
            
            .countdown-container {
                justify-content: center;
                flex-wrap: wrap;
            }
            
            .countdown-item {
                min-width: 50px;
                padding: 8px;
            }
            
            .countdown-number {
                font-size: 20px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new BlogBannerLive();
    });
} else {
    new BlogBannerLive();
}
