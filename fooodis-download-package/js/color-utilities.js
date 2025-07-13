
/**
 * Color Utilities
 * Provides color conversion and manipulation functions
 */

(function() {
    'use strict';

    // Add hexToRgb function to window for global access
    window.hexToRgb = function(hex) {
        // Remove the # if present
        hex = hex.replace(/^#/, '');
        
        // Parse the hex string
        const bigint = parseInt(hex, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        
        return { r, g, b };
    };

    // Additional color utilities
    window.rgbToHex = function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };

    window.lightenColor = function(hex, percent) {
        const { r, g, b } = window.hexToRgb(hex);
        const amount = Math.round(2.55 * percent);
        
        const newR = Math.min(255, r + amount);
        const newG = Math.min(255, g + amount);
        const newB = Math.min(255, b + amount);
        
        return window.rgbToHex(newR, newG, newB);
    };

    console.log('Color utilities loaded successfully');
})();
