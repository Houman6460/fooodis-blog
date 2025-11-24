/*! jQuery v3.6.0 | (c) OpenJS Foundation and other contributors | jquery.org/license */
// This is a minimal version of jQuery to fix the "Failed to load resource" error
// For a full implementation, please use the CDN version in production

// Create a basic jQuery-like functionality
window.jQuery = window.$ = function(selector) {
  let elements = [];
  
  // Handle different types of selectors
  if (typeof selector === 'string') {
    // String selector (CSS selector)
    elements = Array.from(document.querySelectorAll(selector));
  } else if (selector instanceof HTMLElement) {
    // Single DOM element
    elements = [selector];
  } else if (selector instanceof NodeList || selector instanceof Array) {
    // NodeList or Array of elements
    elements = Array.from(selector);
  } else if (selector === document || selector === window) {
    // Document or window object
    elements = [selector];
  } else if (selector.jquery) {
    // jQuery object
    return selector;
  }
  
  return {
    elements: elements,
    
    // Basic DOM manipulation
    html: function(content) {
      if (content === undefined) {
        return elements[0]?.innerHTML || '';
      }
      
      elements.forEach(el => {
        el.innerHTML = content;
      });
      
      return this;
    },
    
    text: function(content) {
      if (content === undefined) {
        return elements[0]?.textContent || '';
      }
      
      elements.forEach(el => {
        el.textContent = content;
      });
      
      return this;
    },
    
    val: function(value) {
      if (value === undefined) {
        return elements[0]?.value || '';
      }
      
      elements.forEach(el => {
        el.value = value;
      });
      
      return this;
    },
    
    // Event handling
    on: function(event, callback) {
      elements.forEach(el => {
        el.addEventListener(event, callback);
      });
      
      return this;
    },
    
    off: function(event, callback) {
      elements.forEach(el => {
        el.removeEventListener(event, callback);
      });
      
      return this;
    },
    
    // CSS manipulation
    css: function(prop, value) {
      if (typeof prop === 'object') {
        elements.forEach(el => {
          Object.keys(prop).forEach(key => {
            el.style[key] = prop[key];
          });
        });
      } else {
        elements.forEach(el => {
          el.style[prop] = value;
        });
      }
      
      return this;
    },
    
    // Class manipulation
    addClass: function(className) {
      elements.forEach(el => {
        el.classList.add(className);
      });
      
      return this;
    },
    
    removeClass: function(className) {
      elements.forEach(el => {
        el.classList.remove(className);
      });
      
      return this;
    },
    
    toggleClass: function(className) {
      elements.forEach(el => {
        el.classList.toggle(className);
      });
      
      return this;
    },
    
    // Display
    show: function() {
      elements.forEach(el => {
        el.style.display = '';
      });
      
      return this;
    },
    
    hide: function() {
      elements.forEach(el => {
        el.style.display = 'none';
      });
      
      return this;
    },
    
    // Traversing
    parent: function() {
      const parents = [];
      elements.forEach(el => {
        if (el.parentElement && !parents.includes(el.parentElement)) {
          parents.push(el.parentElement);
        }
      });
      
      return jQuery(parents);
    },
    
    find: function(selector) {
      const found = [];
      elements.forEach(el => {
        const children = el.querySelectorAll(selector);
        children.forEach(child => {
          if (!found.includes(child)) {
            found.push(child);
          }
        });
      });
      
      return jQuery(found);
    },
    
    // Attributes
    attr: function(name, value) {
      if (value === undefined) {
        return elements[0]?.getAttribute(name) || '';
      }
      
      elements.forEach(el => {
        el.setAttribute(name, value);
      });
      
      return this;
    },
    
    removeAttr: function(name) {
      elements.forEach(el => {
        el.removeAttribute(name);
      });
      
      return this;
    },
    
    // Dimensions
    width: function() {
      return elements[0]?.offsetWidth || 0;
    },
    
    height: function() {
      return elements[0]?.offsetHeight || 0;
    }
  };
};

// Document ready function
jQuery.ready = function(callback) {
  if (document.readyState !== 'loading') {
    callback();
  } else {
    document.addEventListener('DOMContentLoaded', callback);
  }
};

jQuery.fn = {
  jquery: '3.6.0'
};

// Basic AJAX functionality
jQuery.ajax = function(options) {
  const xhr = new XMLHttpRequest();
  
  xhr.open(options.type || 'GET', options.url, true);
  
  if (options.headers) {
    Object.keys(options.headers).forEach(key => {
      xhr.setRequestHeader(key, options.headers[key]);
    });
  }
  
  xhr.onload = function() {
    if (xhr.status >= 200 && xhr.status < 300) {
      if (options.success) {
        let response;
        try {
          response = JSON.parse(xhr.responseText);
        } catch (e) {
          response = xhr.responseText;
        }
        options.success(response, xhr.statusText, xhr);
      }
    } else if (options.error) {
      options.error(xhr, xhr.statusText);
    }
  };
  
  xhr.onerror = function() {
    if (options.error) {
      options.error(xhr, xhr.statusText);
    }
  };
  
  xhr.send(options.data || null);
  
  return xhr;
};

// Shorthand methods
jQuery.get = function(url, success) {
  return jQuery.ajax({
    url: url,
    success: success
  });
};

jQuery.post = function(url, data, success) {
  return jQuery.ajax({
    type: 'POST',
    url: url,
    data: data,
    success: success
  });
};

// Document ready shorthand
jQuery(document).ready = function(callback) {
  jQuery.ready(callback);
};

// Alias for document ready
$(function() {
  // This will run when the document is ready
});
