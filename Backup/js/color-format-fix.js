/**
 * Color Format Fix for Email Popup Enhancer
 * Fixes rgba color format issues in style assignments
 */

(function() {
    console.log('Color Format Fix: Initializing');
    
    // Execute when DOM is loaded
    document.addEventListener('DOMContentLoaded', function() {
        applyColorFormatFix();
    });
    
    // Also apply after a delay to catch late initializations
    setTimeout(applyColorFormatFix, 1000);
    
    /**
     * Apply the color format fix to email popup enhancer
     */
    function applyColorFormatFix() {
        console.log('Color Format Fix: Applying fixes');
        
        // Override the hexToRgb method in EmailPopupEnhancer prototype if it exists
        if (window.EmailPopupEnhancer && EmailPopupEnhancer.prototype.hexToRgb) {
            // Store the original method
            const originalHexToRgb = EmailPopupEnhancer.prototype.hexToRgb;
            
            // Override with fixed version
            EmailPopupEnhancer.prototype.hexToRgb = function(hex) {
                // Call original method to get the RGB object
                const result = originalHexToRgb.call(this, hex);
                
                // If result is null, return null
                if (!result) return null;
                
                // Add a safe toString method that returns hex format instead of rgba
                result.toSafeString = function(opacity) {
                    // If opacity is provided and not 1, create a hex color with alpha
                    if (opacity !== undefined && opacity !== 1) {
                        const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
                        return `#${this.r.toString(16).padStart(2, '0')}${this.g.toString(16).padStart(2, '0')}${this.b.toString(16).padStart(2, '0')}${alpha}`;
                    }
                    
                    // Otherwise, return standard hex
                    return `#${this.r.toString(16).padStart(2, '0')}${this.g.toString(16).padStart(2, '0')}${this.b.toString(16).padStart(2, '0')}`;
                };
                
                return result;
            };
            
            console.log('Color Format Fix: Successfully patched hexToRgb method');
        } else {
            console.log('Color Format Fix: EmailPopupEnhancer or hexToRgb method not found yet, will retry later');
            setTimeout(applyColorFormatFix, 1000);
        }
        
        // Also patch any direct style assignment that might use rgba
        patchStyleAssignments();
    }
    
    /**
     * Patch style assignments that use rgba colors
     */
    function patchStyleAssignments() {
        // Monkeypatch Element.prototype.style.setProperty to handle rgba values
        const originalSetProperty = CSSStyleDeclaration.prototype.setProperty;
        
        CSSStyleDeclaration.prototype.setProperty = function(property, value, priority) {
            // Check if the value is an rgba string
            if (typeof value === 'string' && value.startsWith('rgba(')) {
                try {
                    // Extract RGBA values
                    const rgbaMatch = value.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([0-9.]+)\s*\)/);
                    if (rgbaMatch) {
                        const r = parseInt(rgbaMatch[1]);
                        const g = parseInt(rgbaMatch[2]);
                        const b = parseInt(rgbaMatch[3]);
                        const a = parseFloat(rgbaMatch[4]);
                        
                        // Convert to hex color with alpha
                        const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
                        const hexColor = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}${alpha}`;
                        
                        // Use hex color instead
                        return originalSetProperty.call(this, property, hexColor, priority);
                    }
                } catch (e) {
                    console.error('Error converting rgba to hex:', e);
                }
            }
            
            // Default behavior for non-rgba values
            return originalSetProperty.call(this, property, value, priority);
        };
        
        console.log('Color Format Fix: Successfully patched style.setProperty method');
    }
})();
