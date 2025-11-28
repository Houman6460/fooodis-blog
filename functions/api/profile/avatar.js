/**
 * Profile Avatar API
 * POST /api/profile/avatar - Upload new avatar image
 * DELETE /api/profile/avatar - Remove avatar image
 * 
 * Uploads avatar to R2 storage and updates profile
 */

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * POST /api/profile/avatar - Upload avatar
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') || formData.get('file');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ error: "No avatar file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ 
        error: "Invalid file type. Allowed: JPEG, PNG, GIF, WebP",
        allowed: ALLOWED_TYPES
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ 
        error: "File too large. Maximum size is 5MB",
        maxSize: MAX_SIZE
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get current profile to check for existing avatar
    const currentProfile = await env.DB.prepare(
      "SELECT avatar_url FROM user_profiles WHERE user_id = 'admin'"
    ).first();

    // Delete old avatar from R2 if exists
    if (currentProfile?.avatar_url) {
      try {
        // Extract R2 key from URL
        const oldKey = currentProfile.avatar_url.replace('/api/media/serve/', '');
        if (oldKey.startsWith('avatars/')) {
          await env.MEDIA_BUCKET.delete(decodeURIComponent(oldKey));
        }
      } catch (e) {
        console.error('Error deleting old avatar:', e);
      }
    }

    // Generate new filename
    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const r2Key = `avatars/admin-${timestamp}.${ext}`;

    // Upload to R2
    const fileBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalFilename: file.name,
        uploadedAt: new Date().toISOString(),
        userId: 'admin'
      }
    });

    // Generate URL - don't encode slashes in the path
    const avatarUrl = `/api/media/serve/${r2Key}`;

    // Update profile in D1
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET avatar_url = ?, updated_at = ? WHERE user_id = 'admin'"
    ).bind(avatarUrl, now).run();

    // Also store in media_library for reference
    await env.DB.prepare(`
      INSERT INTO media_library (
        id, filename, original_filename, mime_type, file_size, 
        r2_key, r2_url, folder, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'avatars', ?, ?)
    `).bind(
      `avatar_admin_${timestamp}`,
      `admin-${timestamp}.${ext}`,
      file.name,
      file.type,
      file.size,
      r2Key,
      avatarUrl,
      now,
      now
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      avatar_url: avatarUrl,
      message: "Avatar uploaded successfully"
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * DELETE /api/profile/avatar - Remove avatar
 */
export async function onRequestDelete(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get current avatar
    const profile = await env.DB.prepare(
      "SELECT avatar_url FROM user_profiles WHERE user_id = 'admin'"
    ).first();

    if (profile?.avatar_url && env.MEDIA_BUCKET) {
      try {
        const r2Key = profile.avatar_url.replace('/api/media/serve/', '');
        if (r2Key.startsWith('avatars/')) {
          await env.MEDIA_BUCKET.delete(decodeURIComponent(r2Key));
        }
      } catch (e) {
        console.error('Error deleting avatar from R2:', e);
      }
    }

    // Clear avatar URL in profile
    const now = Date.now();
    await env.DB.prepare(
      "UPDATE user_profiles SET avatar_url = NULL, updated_at = ? WHERE user_id = 'admin'"
    ).bind(now).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Avatar removed successfully"
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
