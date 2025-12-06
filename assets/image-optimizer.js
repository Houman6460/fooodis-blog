/**
 * Fooodis Image Optimizer
 * 
 * Features:
 * - Lazy loading with Intersection Observer
 * - Automatic WebP detection and serving via Cloudflare
 * - Placeholder blur effect while loading
 * - Error handling with fallback
 */

(function() {
  'use strict';

  const ImageOptimizer = {
    // Configuration
    config: {
      lazyLoadThreshold: '200px',  // Load images 200px before they enter viewport
      placeholderColor: '#f0f0f0',
      useWebP: null,  // Auto-detected
      cloudflareEnabled: true  // Use Cloudflare Image Resizing if available
    },

    /**
     * Initialize the optimizer
     */
    init: function() {
      // Detect WebP support
      this.detectWebP().then(supported => {
        this.config.useWebP = supported;
        console.log(`🖼️ WebP support: ${supported ? 'yes' : 'no'}`);
      });

      // Setup lazy loading
      this.setupLazyLoading();
      
      // Add CSS for loading states
      this.injectStyles();

      console.log('🖼️ Image Optimizer initialized');
    },

    /**
     * Detect WebP support
     */
    detectWebP: function() {
      return new Promise(resolve => {
        const webP = new Image();
        webP.onload = webP.onerror = function() {
          resolve(webP.height === 2);
        };
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
      });
    },

    /**
     * Setup lazy loading using Intersection Observer
     */
    setupLazyLoading: function() {
      // Check for native lazy loading support
      if ('loading' in HTMLImageElement.prototype) {
        // Use native lazy loading
        document.querySelectorAll('img:not([loading])').forEach(img => {
          if (!img.dataset.noLazy) {
            img.loading = 'lazy';
          }
        });
      }

      // Also use Intersection Observer for more control
      if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.loadImage(entry.target);
              observer.unobserve(entry.target);
            }
          });
        }, {
          rootMargin: this.config.lazyLoadThreshold
        });

        // Observe all images with data-src attribute
        document.querySelectorAll('img[data-src]').forEach(img => {
          imageObserver.observe(img);
        });

        // Also observe regular images that aren't loaded yet
        document.querySelectorAll('img:not([data-src]):not([data-loaded])').forEach(img => {
          if (!img.complete && img.src) {
            img.dataset.originalSrc = img.src;
            img.classList.add('img-loading');
            imageObserver.observe(img);
          }
        });
      }
    },

    /**
     * Load an image with optimization
     */
    loadImage: function(img) {
      const src = img.dataset.src || img.dataset.originalSrc || img.src;
      if (!src) return;

      // Create optimized URL
      const optimizedSrc = this.getOptimizedUrl(src);
      
      // Create new image to preload
      const newImg = new Image();
      
      newImg.onload = () => {
        img.src = optimizedSrc;
        img.classList.remove('img-loading');
        img.classList.add('img-loaded');
        img.dataset.loaded = 'true';
        
        // Trigger load event for any listeners
        img.dispatchEvent(new Event('optimized-load'));
      };

      newImg.onerror = () => {
        // Fallback to original source
        img.src = src;
        img.classList.remove('img-loading');
        img.classList.add('img-loaded');
        console.warn('Image optimization failed, using original:', src);
      };

      newImg.src = optimizedSrc;
    },

    /**
     * Get optimized URL (using Cloudflare Image Resizing if available)
     */
    getOptimizedUrl: function(src) {
      // Skip data URLs and already optimized URLs
      if (src.startsWith('data:') || src.includes('/cdn-cgi/')) {
        return src;
      }

      // Skip external URLs (not on same domain)
      try {
        const url = new URL(src, window.location.origin);
        if (url.origin !== window.location.origin) {
          return src;
        }
      } catch (e) {
        return src;
      }

      // Use Cloudflare Image Resizing if enabled
      if (this.config.cloudflareEnabled) {
        const format = this.config.useWebP ? 'webp' : 'auto';
        // Cloudflare Image Resizing URL format
        return `/cdn-cgi/image/format=${format},quality=80/${src}`;
      }

      return src;
    },

    /**
     * Inject CSS for loading states
     */
    injectStyles: function() {
      if (document.getElementById('img-optimizer-styles')) return;

      const style = document.createElement('style');
      style.id = 'img-optimizer-styles';
      style.textContent = `
        /* Image loading placeholder */
        img.img-loading {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: img-shimmer 1.5s infinite;
        }

        @keyframes img-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Fade in loaded images */
        img.img-loaded {
          animation: img-fadeIn 0.3s ease-out;
        }

        @keyframes img-fadeIn {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }

        /* Responsive images */
        img {
          max-width: 100%;
          height: auto;
        }
      `;
      document.head.appendChild(style);
    },

    /**
     * Manually optimize an image element
     */
    optimize: function(img) {
      this.loadImage(img);
    },

    /**
     * Optimize all images in a container
     */
    optimizeContainer: function(container) {
      container.querySelectorAll('img').forEach(img => {
        if (!img.dataset.loaded) {
          this.optimize(img);
        }
      });
    }
  };

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ImageOptimizer.init());
  } else {
    ImageOptimizer.init();
  }

  // Expose globally
  window.FooodisImageOptimizer = ImageOptimizer;

})();
