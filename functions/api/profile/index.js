/**
 * Profile Management API
 * GET /api/profile - Get current user profile
 * PUT /api/profile - Update profile information
 * 
 * For a single-admin blog system without full authentication
 */

/**
 * GET /api/profile - Get profile data
 */
export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get the admin profile (user_id = 'admin' for single-user system)
    let profile = await env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = 'admin'"
    ).first();

    // If no profile exists, create default
    if (!profile) {
      const now = Date.now();
      const defaultProfile = {
        user_id: 'admin',
        display_name: 'Admin User',
        email: 'admin@fooodis.com',
        role: 'Administrator',
        bio: '',
        avatar_url: null,
        social_links: JSON.stringify({}),
        preferences: JSON.stringify({
          theme: 'dark',
          notifications: true,
          language: 'en'
        }),
        created_at: now,
        updated_at: now
      };

      await env.DB.prepare(`
        INSERT INTO user_profiles (
          user_id, display_name, email, role, bio, avatar_url, 
          social_links, preferences, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        defaultProfile.user_id,
        defaultProfile.display_name,
        defaultProfile.email,
        defaultProfile.role,
        defaultProfile.bio,
        defaultProfile.avatar_url,
        defaultProfile.social_links,
        defaultProfile.preferences,
        defaultProfile.created_at,
        defaultProfile.updated_at
      ).run();

      profile = defaultProfile;
    }

    // Parse JSON fields
    const formattedProfile = {
      ...profile,
      social_links: profile.social_links ? JSON.parse(profile.social_links) : {},
      preferences: profile.preferences ? JSON.parse(profile.preferences) : {}
    };

    return new Response(JSON.stringify(formattedProfile), {
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
 * PUT /api/profile - Update profile information
 */
export async function onRequestPut(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const data = await request.json();
    const now = Date.now();

    // Build update query
    const updates = [];
    const values = [];

    if (data.display_name !== undefined) {
      updates.push('display_name = ?');
      values.push(data.display_name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      values.push(data.email);
    }
    if (data.role !== undefined) {
      updates.push('role = ?');
      values.push(data.role);
    }
    if (data.bio !== undefined) {
      updates.push('bio = ?');
      values.push(data.bio);
    }
    if (data.avatar_url !== undefined) {
      updates.push('avatar_url = ?');
      values.push(data.avatar_url);
    }
    if (data.social_links !== undefined) {
      updates.push('social_links = ?');
      values.push(JSON.stringify(data.social_links));
    }
    if (data.preferences !== undefined) {
      updates.push('preferences = ?');
      values.push(JSON.stringify(data.preferences));
    }

    if (updates.length === 0) {
      return new Response(JSON.stringify({ error: "No fields to update" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    updates.push('updated_at = ?');
    values.push(now);
    values.push('admin'); // user_id

    await env.DB.prepare(`
      UPDATE user_profiles SET ${updates.join(', ')} WHERE user_id = ?
    `).bind(...values).run();

    // Fetch updated profile
    const profile = await env.DB.prepare(
      "SELECT * FROM user_profiles WHERE user_id = 'admin'"
    ).first();

    // Also update author name in blog_posts if display_name changed
    if (data.display_name) {
      await env.DB.prepare(
        "UPDATE blog_posts SET author = ? WHERE author = 'Admin' OR author = 'Admin User'"
      ).bind(data.display_name).run();
    }

    return new Response(JSON.stringify({ 
      success: true, 
      profile: {
        ...profile,
        social_links: profile.social_links ? JSON.parse(profile.social_links) : {},
        preferences: profile.preferences ? JSON.parse(profile.preferences) : {}
      }
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
