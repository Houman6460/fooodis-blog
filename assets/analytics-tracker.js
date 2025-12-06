/**
 * Fooodis Analytics Tracker
 * Lightweight event tracking for user behavior analytics
 * 
 * Usage:
 *   FooodisAnalytics.track('event_name', { property: 'value' });
 *   FooodisAnalytics.pageView();
 */

(function() {
  'use strict';

  // Generate or retrieve session ID
  function getSessionId() {
    let sessionId = sessionStorage.getItem('fooodis_session_id');
    if (!sessionId) {
      sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('fooodis_session_id', sessionId);
    }
    return sessionId;
  }

  // Get user ID if logged in
  function getUserId() {
    // Check for logged-in user in localStorage
    const user = localStorage.getItem('supportPortalUser');
    if (user) {
      try {
        return JSON.parse(user).id || JSON.parse(user).email;
      } catch (e) {}
    }
    return null;
  }

  // Analytics tracker object
  window.FooodisAnalytics = {
    endpoint: '/api/analytics/events',
    sessionId: getSessionId(),
    userId: getUserId(),
    queue: [],
    initialized: false,

    /**
     * Initialize the tracker
     */
    init: function(options = {}) {
      if (this.initialized) return;
      
      this.endpoint = options.endpoint || this.endpoint;
      this.initialized = true;

      // Track initial page view
      if (options.trackPageViews !== false) {
        this.pageView();
      }

      // Flush queue
      this.flushQueue();

      // Track navigation events (SPA support)
      if (options.trackNavigation !== false) {
        this.setupNavigationTracking();
      }

      console.log('📊 Fooodis Analytics initialized');
    },

    /**
     * Track an event
     */
    track: function(event, properties = {}, category = 'engagement') {
      const payload = {
        event,
        category,
        properties,
        sessionId: this.sessionId,
        userId: this.userId,
        timestamp: Date.now(),
        url: window.location.href,
        path: window.location.pathname
      };

      // If not initialized yet, queue the event
      if (!this.initialized) {
        this.queue.push(payload);
        return;
      }

      this.send(payload);
    },

    /**
     * Track page view
     */
    pageView: function(pageName) {
      this.track('page_view', {
        page: pageName || document.title,
        path: window.location.pathname,
        referrer: document.referrer,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      }, 'navigation');
    },

    /**
     * Track chatbot events
     */
    chatbotOpen: function() {
      this.track('chatbot_open', {}, 'engagement');
    },

    chatbotMessage: function(messageType = 'user') {
      this.track('chatbot_message', { type: messageType }, 'engagement');
    },

    chatbotClose: function() {
      this.track('chatbot_close', {}, 'engagement');
    },

    /**
     * Track support events
     */
    ticketCreated: function(category) {
      this.track('ticket_created', { category }, 'support');
    },

    ticketViewed: function(ticketId) {
      this.track('ticket_viewed', { ticketId }, 'support');
    },

    /**
     * Track conversion events
     */
    newsletterSubscribe: function(source = 'popup') {
      this.track('newsletter_subscribe', { source }, 'conversion');
    },

    leadCapture: function(source = 'chatbot') {
      this.track('lead_capture', { source }, 'conversion');
    },

    /**
     * Track click events
     */
    trackClick: function(element, label) {
      this.track('click', {
        element: element.tagName,
        label: label || element.textContent?.substring(0, 50),
        href: element.href || null
      }, 'interaction');
    },

    /**
     * Setup navigation tracking for SPAs
     */
    setupNavigationTracking: function() {
      // Track history changes
      const originalPushState = history.pushState;
      const self = this;
      
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        self.pageView();
      };

      window.addEventListener('popstate', () => {
        this.pageView();
      });
    },

    /**
     * Send event to server
     */
    send: function(payload) {
      // Use sendBeacon for reliability (won't be cancelled on page unload)
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.endpoint, JSON.stringify(payload));
      } else {
        // Fallback to fetch
        fetch(this.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true
        }).catch(() => {
          // Silently fail - analytics shouldn't break the page
        });
      }
    },

    /**
     * Flush queued events
     */
    flushQueue: function() {
      while (this.queue.length > 0) {
        const payload = this.queue.shift();
        this.send(payload);
      }
    }
  };

  // Auto-initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      window.FooodisAnalytics.init();
    });
  } else {
    window.FooodisAnalytics.init();
  }

})();
