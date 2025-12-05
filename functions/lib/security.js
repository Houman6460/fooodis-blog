/**
 * Security Module for Cloudflare Protection
 * - Rate limiting
 * - Turnstile verification
 * - Brute force protection
 * - Account lockout
 */

/**
 * Rate limiting configuration
 */
const RATE_LIMIT_CONFIG = {
  login: {
    maxAttempts: 5,        // Max login attempts
    windowSeconds: 300,    // 5 minute window
    blockDurationSeconds: 900  // 15 minute block
  },
  api: {
    maxRequests: 100,      // Max API requests
    windowSeconds: 60      // 1 minute window
  }
};

/**
 * Check rate limit for an IP/action combination
 * @param {Object} env - Cloudflare environment with KV binding
 * @param {string} ip - Client IP address
 * @param {string} action - Action type (login, api, etc.)
 * @returns {Object} { allowed: boolean, remaining: number, resetAt: number }
 */
export async function checkRateLimit(env, ip, action = 'api') {
  if (!env.KV) {
    console.warn('KV not available for rate limiting');
    return { allowed: true, remaining: 999, resetAt: 0 };
  }

  const config = RATE_LIMIT_CONFIG[action] || RATE_LIMIT_CONFIG.api;
  const key = `rate_limit:${action}:${ip}`;
  
  try {
    const data = await env.KV.get(key);
    const now = Date.now();
    
    if (!data) {
      // First request, create record
      await env.KV.put(key, JSON.stringify({
        count: 1,
        firstAttempt: now,
        blocked: false
      }), { expirationTtl: config.windowSeconds });
      
      return { 
        allowed: true, 
        remaining: config.maxAttempts - 1, 
        resetAt: now + (config.windowSeconds * 1000)
      };
    }
    
    const record = JSON.parse(data);
    
    // Check if blocked
    if (record.blocked) {
      const blockExpiry = record.blockedAt + (config.blockDurationSeconds * 1000);
      if (now < blockExpiry) {
        return { 
          allowed: false, 
          remaining: 0, 
          resetAt: blockExpiry,
          blocked: true,
          message: `Too many attempts. Try again in ${Math.ceil((blockExpiry - now) / 60000)} minutes.`
        };
      }
      // Block expired, reset
      await env.KV.delete(key);
      return { allowed: true, remaining: config.maxAttempts - 1, resetAt: now + (config.windowSeconds * 1000) };
    }
    
    // Check window
    if (now - record.firstAttempt > config.windowSeconds * 1000) {
      // Window expired, reset
      await env.KV.put(key, JSON.stringify({
        count: 1,
        firstAttempt: now,
        blocked: false
      }), { expirationTtl: config.windowSeconds });
      
      return { 
        allowed: true, 
        remaining: config.maxAttempts - 1, 
        resetAt: now + (config.windowSeconds * 1000)
      };
    }
    
    // Within window, increment count
    record.count++;
    
    if (record.count > config.maxAttempts) {
      // Block the IP
      record.blocked = true;
      record.blockedAt = now;
      await env.KV.put(key, JSON.stringify(record), { 
        expirationTtl: config.blockDurationSeconds 
      });
      
      return { 
        allowed: false, 
        remaining: 0, 
        resetAt: now + (config.blockDurationSeconds * 1000),
        blocked: true,
        message: `Too many attempts. Try again in ${config.blockDurationSeconds / 60} minutes.`
      };
    }
    
    // Update count
    await env.KV.put(key, JSON.stringify(record), { 
      expirationTtl: config.windowSeconds 
    });
    
    return { 
      allowed: true, 
      remaining: config.maxAttempts - record.count, 
      resetAt: record.firstAttempt + (config.windowSeconds * 1000)
    };
    
  } catch (error) {
    console.error('Rate limit check error:', error);
    return { allowed: true, remaining: 999, resetAt: 0 };
  }
}

/**
 * Record failed login attempt for account lockout
 * @param {Object} env - Cloudflare environment
 * @param {string} email - User email
 * @param {string} ip - Client IP
 * @returns {Object} { locked: boolean, remainingAttempts: number }
 */
export async function recordFailedLogin(env, email, ip) {
  if (!env.KV) return { locked: false, remainingAttempts: 5 };
  
  const key = `failed_login:${email.toLowerCase()}`;
  const maxAttempts = 5;
  const lockoutMinutes = 30;
  
  try {
    const data = await env.KV.get(key);
    const now = Date.now();
    
    let record = data ? JSON.parse(data) : { attempts: [], locked: false };
    
    // Check if currently locked
    if (record.locked && record.lockedUntil > now) {
      return { 
        locked: true, 
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
        message: `Account locked. Try again in ${Math.ceil((record.lockedUntil - now) / 60000)} minutes.`
      };
    }
    
    // Reset if lock expired
    if (record.locked && record.lockedUntil <= now) {
      record = { attempts: [], locked: false };
    }
    
    // Add this attempt
    record.attempts.push({ time: now, ip });
    
    // Keep only attempts from last 30 minutes
    record.attempts = record.attempts.filter(a => now - a.time < 30 * 60 * 1000);
    
    // Check if should lock
    if (record.attempts.length >= maxAttempts) {
      record.locked = true;
      record.lockedUntil = now + (lockoutMinutes * 60 * 1000);
      
      await env.KV.put(key, JSON.stringify(record), { 
        expirationTtl: lockoutMinutes * 60 
      });
      
      return { 
        locked: true, 
        remainingAttempts: 0,
        lockedUntil: record.lockedUntil,
        message: `Account locked due to too many failed attempts. Try again in ${lockoutMinutes} minutes.`
      };
    }
    
    await env.KV.put(key, JSON.stringify(record), { 
      expirationTtl: 30 * 60 
    });
    
    return { 
      locked: false, 
      remainingAttempts: maxAttempts - record.attempts.length
    };
    
  } catch (error) {
    console.error('Failed login record error:', error);
    return { locked: false, remainingAttempts: 5 };
  }
}

/**
 * Clear failed login attempts on successful login
 * @param {Object} env - Cloudflare environment
 * @param {string} email - User email
 */
export async function clearFailedLogins(env, email) {
  if (!env.KV) return;
  
  try {
    await env.KV.delete(`failed_login:${email.toLowerCase()}`);
  } catch (error) {
    console.error('Clear failed logins error:', error);
  }
}

/**
 * Check if account is locked
 * @param {Object} env - Cloudflare environment
 * @param {string} email - User email
 * @returns {Object} { locked: boolean, lockedUntil: number }
 */
export async function checkAccountLock(env, email) {
  if (!env.KV) return { locked: false };
  
  try {
    const data = await env.KV.get(`failed_login:${email.toLowerCase()}`);
    if (!data) return { locked: false };
    
    const record = JSON.parse(data);
    const now = Date.now();
    
    if (record.locked && record.lockedUntil > now) {
      return { 
        locked: true, 
        lockedUntil: record.lockedUntil,
        message: `Account locked. Try again in ${Math.ceil((record.lockedUntil - now) / 60000)} minutes.`
      };
    }
    
    return { locked: false };
  } catch (error) {
    return { locked: false };
  }
}

/**
 * Verify Cloudflare Turnstile token
 * @param {string} token - Turnstile token from client
 * @param {string} ip - Client IP address
 * @param {string} secretKey - Turnstile secret key
 * @returns {Object} { success: boolean, error: string }
 */
export async function verifyTurnstile(token, ip, secretKey) {
  if (!token) {
    return { success: false, error: 'Turnstile verification required' };
  }
  
  if (!secretKey) {
    console.warn('Turnstile secret key not configured, skipping verification');
    return { success: true };
  }
  
  try {
    const formData = new FormData();
    formData.append('secret', secretKey);
    formData.append('response', token);
    if (ip) formData.append('remoteip', ip);
    
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.success) {
      return { success: true };
    } else {
      return { 
        success: false, 
        error: 'Turnstile verification failed',
        codes: result['error-codes']
      };
    }
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return { success: false, error: 'Verification service unavailable' };
  }
}

/**
 * Get client IP from Cloudflare headers
 * @param {Request} request - Incoming request
 * @returns {string} Client IP address
 */
export function getClientIP(request) {
  return request.headers.get('CF-Connecting-IP') || 
         request.headers.get('X-Real-IP') ||
         request.headers.get('X-Forwarded-For')?.split(',')[0]?.trim() ||
         'unknown';
}

/**
 * Log security event
 * @param {Object} env - Cloudflare environment
 * @param {string} event - Event type
 * @param {Object} details - Event details
 */
export async function logSecurityEvent(env, event, details) {
  if (!env.DB) return;
  
  try {
    await env.DB.prepare(`
      INSERT INTO activity_log (id, user_id, action, details, ip_address, user_agent, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      `sec_${crypto.randomUUID().split('-')[0]}`,
      details.userId || 'system',
      `security:${event}`,
      JSON.stringify(details),
      details.ip || 'unknown',
      details.userAgent || 'unknown',
      Date.now()
    ).run();
  } catch (error) {
    console.error('Security log error:', error);
  }
}

/**
 * Create security headers for response
 * @returns {Object} Security headers
 */
export function getSecurityHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
  };
}
