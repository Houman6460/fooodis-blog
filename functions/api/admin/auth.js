/**
 * Admin Authentication API with Cloudflare Protection
 * POST /api/admin/auth - Login (with rate limiting, Turnstile, account lockout)
 * GET /api/admin/auth - Validate session
 * DELETE /api/admin/auth - Logout
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
 * Hash password with salt
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fooodis_admin_salt_2024_secure');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate secure auth token
 */
async function generateToken(userId, email) {
  const data = `admin:${userId}:${email}:${Date.now()}:${crypto.randomUUID()}`;
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return 'adm_' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * GET /api/admin/auth - Validate admin session
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  
  // Check for auth token in cookie or header
  const cookies = request.headers.get('Cookie') || '';
  const authHeader = request.headers.get('Authorization') || '';
  
  let token = null;
  
  // Try to get token from cookie
  const cookieMatch = cookies.match(/fooodis_admin_token=([^;]+)/);
  if (cookieMatch) {
    token = cookieMatch[1];
  }
  
  // Or from Authorization header
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  
  if (!token) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "No authentication token provided",
      authenticated: false
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.KV) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "KV storage not configured" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Check KV for session
    const sessionData = await env.KV.get(`admin_session_${token}`);
    
    if (!sessionData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid or expired session",
        authenticated: false
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const session = JSON.parse(sessionData);
    
    // Check if session is expired (24 hours default, 30 days if remember me)
    const maxAge = session.rememberMe ? (30 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
    if (Date.now() - session.created_at > maxAge) {
      // Session expired, delete it
      await env.KV.delete(`admin_session_${token}`);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Session expired",
        authenticated: false
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get user info from database
    let user = null;
    if (env.DB) {
      user = await env.DB.prepare(
        "SELECT user_id, display_name, email, role, avatar_url FROM user_profiles WHERE user_id = ?"
      ).bind(session.user_id).first();
    }

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User not found",
        authenticated: false
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Extend session if active
    session.last_active = Date.now();
    await env.KV.put(`admin_session_${token}`, JSON.stringify(session), {
      expirationTtl: session.rememberMe ? (30 * 24 * 60 * 60) : (24 * 60 * 60)
    });

    return new Response(JSON.stringify({
      success: true,
      authenticated: true,
      user: {
        id: user.user_id,
        name: user.display_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url
      }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Auth validation error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST /api/admin/auth - Admin login with security protection
 */
export async function onRequestPost(context) {
  const { request, env } = context;
  const clientIP = getClientIP(request);
  const userAgent = request.headers.get('User-Agent') || 'unknown';
  const securityHeaders = { ...getSecurityHeaders(), "Content-Type": "application/json" };

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database not configured" 
    }), {
      status: 500,
      headers: securityHeaders
    });
  }

  try {
    // Check rate limit first
    const rateLimit = await checkRateLimit(env, clientIP, 'login');
    if (!rateLimit.allowed) {
      await logSecurityEvent(env, 'rate_limit_blocked', { ip: clientIP, userAgent, type: 'admin_login' });
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
    const { email, password, rememberMe, turnstileToken } = data;

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email and password are required" 
      }), {
        status: 400,
        headers: securityHeaders
      });
    }

    // Verify Turnstile if configured
    if (env.TURNSTILE_SECRET_KEY) {
      const turnstileResult = await verifyTurnstile(turnstileToken, clientIP, env.TURNSTILE_SECRET_KEY);
      if (!turnstileResult.success) {
        await logSecurityEvent(env, 'turnstile_failed', { ip: clientIP, userAgent, email });
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

    const normalizedEmail = email.toLowerCase().trim();

    // Check if account is locked
    const lockStatus = await checkAccountLock(env, normalizedEmail);
    if (lockStatus.locked) {
      await logSecurityEvent(env, 'locked_account_attempt', { ip: clientIP, userAgent, email: normalizedEmail });
      return new Response(JSON.stringify({ 
        success: false, 
        error: lockStatus.message || 'Account is temporarily locked due to too many failed attempts.',
        locked: true,
        retryAfter: Math.ceil((lockStatus.lockedUntil - Date.now()) / 1000)
      }), {
        status: 423,
        headers: securityHeaders
      });
    }

    // Find admin user
    const user = await env.DB.prepare(
      "SELECT user_id, display_name, email, role, password_hash, avatar_url FROM user_profiles WHERE email = ?"
    ).bind(normalizedEmail).first();

    if (!user) {
      // Record failed attempt
      const failResult = await recordFailedLogin(env, normalizedEmail, clientIP);
      await logSecurityEvent(env, 'failed_login', { ip: clientIP, userAgent, email: normalizedEmail, reason: 'user_not_found' });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid email or password",
        remainingAttempts: failResult.remainingAttempts
      }), {
        status: 401,
        headers: securityHeaders
      });
    }

    // Check if user has admin role
    if (user.role !== 'Administrator' && user.role !== 'admin') {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Access denied. Admin privileges required." 
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verify password
    const passwordHash = await hashPassword(password);
    
    if (user.password_hash && user.password_hash !== passwordHash) {
      // Record failed attempt
      const failResult = await recordFailedLogin(env, normalizedEmail, clientIP);
      await logSecurityEvent(env, 'failed_login', { ip: clientIP, userAgent, email: normalizedEmail, reason: 'invalid_password' });
      
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid email or password",
        remainingAttempts: failResult.remainingAttempts,
        locked: failResult.locked
      }), {
        status: 401,
        headers: securityHeaders
      });
    }

    // If no password hash set, this is first login - set the password
    if (!user.password_hash) {
      await env.DB.prepare(
        "UPDATE user_profiles SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE user_id = ?"
      ).bind(passwordHash, Date.now(), Date.now(), user.user_id).run();
      console.log(`Initial password set for: ${normalizedEmail}`);
    }

    const now = Date.now();

    // Clear failed login attempts on successful login
    await clearFailedLogins(env, normalizedEmail);
    
    // Log successful login
    await logSecurityEvent(env, 'successful_login', { ip: clientIP, userAgent, email: normalizedEmail, userId: user.user_id });

    // Generate token
    const token = await generateToken(user.user_id, normalizedEmail);

    // Store session in KV
    if (env.KV) {
      const session = {
        user_id: user.user_id,
        email: normalizedEmail,
        role: user.role,
        created_at: now,
        last_active: now,
        rememberMe: !!rememberMe,
        ip: request.headers.get('CF-Connecting-IP') || 'unknown',
        userAgent: request.headers.get('User-Agent') || 'unknown'
      };

      await env.KV.put(`admin_session_${token}`, JSON.stringify(session), {
        expirationTtl: rememberMe ? (30 * 24 * 60 * 60) : (24 * 60 * 60)
      });
    }

    // Update last login in database
    await env.DB.prepare(
      "UPDATE user_profiles SET last_login = ?, login_count = COALESCE(login_count, 0) + 1, updated_at = ? WHERE user_id = ?"
    ).bind(now, now, user.user_id).run();

    // Log activity
    if (env.DB) {
      try {
        await env.DB.prepare(`
          INSERT INTO activity_log (id, user_id, action, details, ip_address, user_agent, created_at)
          VALUES (?, ?, 'login', ?, ?, ?, ?)
        `).bind(
          `act_${crypto.randomUUID().split('-')[0]}`,
          user.user_id,
          JSON.stringify({ email: normalizedEmail }),
          request.headers.get('CF-Connecting-IP') || 'unknown',
          request.headers.get('User-Agent') || 'unknown',
          now
        ).run();
      } catch (e) {
        console.error('Activity log error:', e);
      }
    }

    // Set cookie for the token
    const cookieOptions = [
      `fooodis_admin_token=${token}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Strict',
      rememberMe ? 'Max-Age=2592000' : '' // 30 days if remember me
    ].filter(Boolean).join('; ');

    return new Response(JSON.stringify({
      success: true,
      message: "Login successful",
      user: {
        id: user.user_id,
        name: user.display_name,
        email: user.email,
        role: user.role,
        avatar: user.avatar_url
      },
      token
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Set-Cookie": cookieOptions
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * DELETE /api/admin/auth - Admin logout
 */
export async function onRequestDelete(context) {
  const { request, env } = context;

  // Get token from cookie or header
  const cookies = request.headers.get('Cookie') || '';
  const authHeader = request.headers.get('Authorization') || '';
  
  let token = null;
  const cookieMatch = cookies.match(/fooodis_admin_token=([^;]+)/);
  if (cookieMatch) {
    token = cookieMatch[1];
  }
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Remove session from KV
  if (token && env.KV) {
    try {
      // Get session to log activity
      const sessionData = await env.KV.get(`admin_session_${token}`);
      if (sessionData && env.DB) {
        const session = JSON.parse(sessionData);
        try {
          await env.DB.prepare(`
            INSERT INTO activity_log (id, user_id, action, details, ip_address, user_agent, created_at)
            VALUES (?, ?, 'logout', ?, ?, ?, ?)
          `).bind(
            `act_${crypto.randomUUID().split('-')[0]}`,
            session.user_id,
            JSON.stringify({ email: session.email }),
            request.headers.get('CF-Connecting-IP') || 'unknown',
            request.headers.get('User-Agent') || 'unknown',
            Date.now()
          ).run();
        } catch (e) {
          console.error('Activity log error:', e);
        }
      }
      
      await env.KV.delete(`admin_session_${token}`);
    } catch (e) {
      console.error('KV error:', e);
    }
  }

  // Clear the cookie
  return new Response(JSON.stringify({
    success: true,
    message: "Logged out successfully"
  }), {
    headers: { 
      "Content-Type": "application/json",
      "Set-Cookie": "fooodis_admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
    }
  });
}

/**
 * PUT /api/admin/auth - Change password
 */
export async function onRequestPut(context) {
  const { request, env } = context;

  if (!env.DB || !env.KV) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database not configured" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Validate session first
  const cookies = request.headers.get('Cookie') || '';
  const authHeader = request.headers.get('Authorization') || '';
  
  let token = null;
  const cookieMatch = cookies.match(/fooodis_admin_token=([^;]+)/);
  if (cookieMatch) {
    token = cookieMatch[1];
  }
  if (!token && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Not authenticated" 
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const sessionData = await env.KV.get(`admin_session_${token}`);
  if (!sessionData) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Invalid session" 
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const session = JSON.parse(sessionData);

  try {
    const data = await request.json();
    const { currentPassword, newPassword } = data;

    if (!currentPassword || !newPassword) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Current and new password are required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (newPassword.length < 8) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "New password must be at least 8 characters" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get user and verify current password
    const user = await env.DB.prepare(
      "SELECT user_id, password_hash FROM user_profiles WHERE user_id = ?"
    ).bind(session.user_id).first();

    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User not found" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const currentHash = await hashPassword(currentPassword);
    if (user.password_hash && user.password_hash !== currentHash) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Current password is incorrect" 
      }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Update password
    const newHash = await hashPassword(newPassword);
    const now = Date.now();

    await env.DB.prepare(
      "UPDATE user_profiles SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE user_id = ?"
    ).bind(newHash, now, now, session.user_id).run();

    // Log activity
    try {
      await env.DB.prepare(`
        INSERT INTO activity_log (id, user_id, action, details, ip_address, user_agent, created_at)
        VALUES (?, ?, 'password_change', ?, ?, ?, ?)
      `).bind(
        `act_${crypto.randomUUID().split('-')[0]}`,
        session.user_id,
        JSON.stringify({ success: true }),
        request.headers.get('CF-Connecting-IP') || 'unknown',
        request.headers.get('User-Agent') || 'unknown',
        now
      ).run();
    } catch (e) {
      console.error('Activity log error:', e);
    }

    return new Response(JSON.stringify({
      success: true,
      message: "Password changed successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Password change error:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
