/**
 * Password Change API
 * POST /api/profile/password - Change password
 * 
 * Note: In a production app, you would use proper authentication
 * This is a simplified version for the single-admin blog system
 */

/**
 * POST /api/profile/password - Change password
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const { current_password, new_password, confirm_password } = data;

    // Validation
    if (!current_password || !new_password || !confirm_password) {
      return new Response(JSON.stringify({ error: "All password fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (new_password !== confirm_password) {
      return new Response(JSON.stringify({ error: "New passwords do not match" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (new_password.length < 8) {
      return new Response(JSON.stringify({ error: "Password must be at least 8 characters" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get current password from DB
    const profile = await env.DB.prepare(
      "SELECT password_hash FROM user_profiles WHERE user_id = 'admin'"
    ).first();

    // Simple password verification (in production, use proper hashing like bcrypt)
    // For this demo, we'll use a simple hash
    const currentHash = await hashPassword(current_password);
    
    // If no password is set yet, allow any current password
    if (profile?.password_hash && profile.password_hash !== currentHash) {
      return new Response(JSON.stringify({ error: "Current password is incorrect" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Hash new password
    const newHash = await hashPassword(new_password);

    // Update password
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET password_hash = ?, password_changed_at = ?, updated_at = ? WHERE user_id = 'admin'"
    ).bind(newHash, now, now).run();

    // Log the password change
    try {
      await env.DB.prepare(`
        INSERT INTO activity_log (id, user_id, action, details, created_at)
        VALUES (?, 'admin', 'password_change', ?, ?)
      `).bind(
        crypto.randomUUID(),
        JSON.stringify({ timestamp: new Date().toISOString() }),
        now
      ).run();
    } catch (e) {
      // Activity log table might not exist
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Password updated successfully"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * Simple password hashing using Web Crypto API
 * Note: In production, use a proper library like bcrypt
 */
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'fooodis_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
