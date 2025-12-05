/**
 * Admin Setup API
 * POST /api/admin/setup - Initialize admin account (one-time setup)
 * 
 * This endpoint should be disabled after initial setup in production
 */

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
 * POST /api/admin/setup - Setup initial admin account
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database not configured" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const { email, password, name, setupKey } = data;

    // Require a setup key to prevent unauthorized access
    // In production, this should be set as an environment variable
    const validSetupKey = env.ADMIN_SETUP_KEY || 'fooodis_initial_setup_2024';
    
    if (setupKey !== validSetupKey) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid setup key" 
      }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Email and password are required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Password must be at least 8 characters" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const passwordHash = await hashPassword(password);
    const now = Date.now();

    // Check if admin already exists
    const existingAdmin = await env.DB.prepare(
      "SELECT user_id FROM user_profiles WHERE email = ?"
    ).bind(normalizedEmail).first();

    if (existingAdmin) {
      // Update existing admin password
      await env.DB.prepare(`
        UPDATE user_profiles 
        SET password_hash = ?, display_name = ?, updated_at = ?
        WHERE email = ?
      `).bind(passwordHash, name || 'Admin User', now, normalizedEmail).run();

      return new Response(JSON.stringify({
        success: true,
        message: "Admin account updated successfully",
        userId: existingAdmin.user_id
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Create new admin account
    const userId = 'admin_' + crypto.randomUUID().split('-')[0];

    await env.DB.prepare(`
      INSERT INTO user_profiles (user_id, display_name, email, role, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, 'Administrator', ?, ?, ?)
    `).bind(userId, name || 'Admin User', normalizedEmail, passwordHash, now, now).run();

    return new Response(JSON.stringify({
      success: true,
      message: "Admin account created successfully",
      userId: userId
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Admin setup error:', error);
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
 * GET /api/admin/setup - Check if setup is needed
 */
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: "Database not configured" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Check if any admin with password exists
    const adminCount = await env.DB.prepare(
      "SELECT COUNT(*) as count FROM user_profiles WHERE role = 'Administrator' AND password_hash IS NOT NULL"
    ).first();

    const setupNeeded = !adminCount || adminCount.count === 0;

    return new Response(JSON.stringify({
      success: true,
      setupNeeded: setupNeeded,
      message: setupNeeded ? "Admin setup required" : "Admin already configured"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
