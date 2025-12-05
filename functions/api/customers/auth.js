/**
 * Customer Authentication API with Cloudflare Protection
 * POST /api/customers/auth - Login (with rate limiting, Turnstile)
 * DELETE /api/customers/auth - Logout
 * GET /api/customers/auth - Validate token
 */

import {
  checkRateLimit,
  recordFailedLogin,
  clearFailedLogins,
  checkAccountLock,
  verifyTurnstile,
  getClientIP,
  logSecurityEvent,
  getSecurityHeaders
} from '../../lib/security.js';

/**
 * GET /api/customers/auth - Validate auth token
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ success: false, error: "No token provided" }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const token = authHeader.substring(7);

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Check KV for token
    let tokenData = null;
    if (env.KV) {
      try {
        const cached = await env.KV.get(`auth_${token}`);
        if (cached) {
          tokenData = JSON.parse(cached);
        }
      } catch (e) {
        console.error('KV error:', e);
      }
    }

    if (!tokenData) {
      return new Response(JSON.stringify({ success: false, error: "Invalid or expired token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get customer info
    const customer = await env.DB.prepare(
      "SELECT id, email, name, phone, company, status, total_tickets, last_login FROM support_customers WHERE id = ?"
    ).bind(tokenData.customer_id).first();

    if (!customer || customer.status !== 'active') {
      return new Response(JSON.stringify({ success: false, error: "Account not found or inactive" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      data: { customer }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST /api/customers/auth - Login with security protection
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const securityHeaders = { ...getSecurityHeaders(), "Content-Type": "application/json" };

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: securityHeaders
    });
  }

  try {
    // Check rate limit first
    const rateLimit = await checkRateLimit(env, clientIP, 'login');
    if (!rateLimit.allowed) {
      await logSecurityEvent(env, 'rate_limit_blocked', { ip: clientIP, userAgent, type: 'customer_login' });
      return new Response(JSON.stringify({ 
        success: false, 
        error: rateLimit.message || 'Too many login attempts. Please try again later.',
        retryAfter: Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
      }), {
        status: 429,
        headers: { 
          ...securityHeaders,
          'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
        }
      });
    }

    const data = await request.json();
    const { turnstileToken } = data;

    if (!data.email) {
      return new Response(JSON.stringify({ success: false, error: "Email is required" }), {
        status: 400,
        headers: securityHeaders
      });
    }

    // Verify Turnstile if configured
    if (env.TURNSTILE_SECRET_KEY) {
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIP, env.TURNSTILE_SECRET_KEY);
      if (!turnstileResult.success) {
        await logSecurityEvent(env, 'turnstile_failed', { ip: clientIP, userAgent, email: data.email });
        return new Response(JSON.stringify({ 
          success: false, 
          error: turnstileResult.error || 'Security verification failed. Please try again.',
          requiresTurnstile: true
        }), {
          status: 403,
          headers: securityHeaders
        });
      }
    }

    const email = data.email.toLowerCase().trim();

    // Check if account is locked
    const lockStatus = await checkAccountLock(env, email);
    if (lockStatus.locked) {
      await logSecurityEvent(env, 'locked_account_attempt', { ip: clientIP, userAgent, email });
      return new Response(JSON.stringify({ 
        success: false, 
        error: lockStatus.message || 'Account is temporarily locked.',
        locked: true,
        retryAfter: Math.ceil((lockStatus.lockedUntil - Date.now()) / 1000)
      }), {
        status: 423,
        headers: securityHeaders
      });
    }

    // Find customer
    const customer = await env.DB.prepare(
      "SELECT * FROM support_customers WHERE email = ?"
    ).bind(email).first();

    if (!customer) {
      // Auto-create customer for easy onboarding
      const now = Date.now();
      const customerId = `cust_${crypto.randomUUID().split('-')[0]}`;
      
      await env.DB.prepare(`
        INSERT INTO support_customers (id, email, name, status, created_at, updated_at)
        VALUES (?, ?, ?, 'active', ?, ?)
      `).bind(customerId, email, data.name || email.split('@')[0], now, now).run();

      const token = await generateToken(customerId, email);

      // Store token in KV
      if (env.KV) {
        await env.KV.put(`auth_${token}`, JSON.stringify({
          customer_id: customerId,
          email,
          created_at: now
        }), { expirationTtl: 86400 * 7 });
      }

      return new Response(JSON.stringify({
        success: true,
        message: "Account created and logged in",
        data: {
          customer: {
            id: customerId,
            email,
            name: data.name || email.split('@')[0]
          },
          token,
          newAccount: true
        }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if password required and validate
    if (customer.password_hash && data.password) {
      const passwordHash = await hashPassword(data.password);
      if (passwordHash !== customer.password_hash) {
        // Record failed attempt
        const failResult = await recordFailedLogin(env, email, clientIP);
        await logSecurityEvent(env, 'failed_login', { ip: clientIP, userAgent, email, reason: 'invalid_password', type: 'customer' });
        
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Invalid password",
          remainingAttempts: failResult.remainingAttempts,
          locked: failResult.locked
        }), {
          status: 401,
          headers: securityHeaders
        });
      }
    }

    // Check account status
    if (customer.status !== 'active') {
      return new Response(JSON.stringify({ success: false, error: "Account is inactive" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();

    // Generate token
    const token = await generateToken(customer.id, email);

    // Store token in KV
    if (env.KV) {
      await env.KV.put(`auth_${token}`, JSON.stringify({
        customer_id: customer.id,
        email,
        created_at: now
      }), { expirationTtl: 86400 * 7 });
    }

    // Update last login
    await env.DB.prepare(
      "UPDATE support_customers SET last_login = ?, login_count = login_count + 1 WHERE id = ?"
    ).bind(now, customer.id).run();

    return new Response(JSON.stringify({
      success: true,
      message: "Login successful",
      data: {
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
          phone: customer.phone,
          company: customer.company,
          total_tickets: customer.total_tickets
        },
        token
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * DELETE /api/customers/auth - Logout
 */
export async function onRequestDelete(context) {
  const { request, env } = context;

  const authHeader = request.headers.get('Authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Remove token from KV
    if (env.KV) {
      try {
        await env.KV.delete(`auth_${token}`);
      } catch (e) {
        console.error('KV error:', e);
      }
    }
  }

  return new Response(JSON.stringify({
    success: true,
    message: "Logged out successfully"
  }), {
    headers: { "Content-Type": "application/json" }
  });
}

/**
 * Hash password
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fooodis_support_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate auth token
 */
async function generateToken(customerId, email) {
  const data = `${customerId}:${email}:${Date.now()}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
