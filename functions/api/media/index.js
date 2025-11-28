/**
 * Media Library API
 * GET /api/media - List all media files
 * POST /api/media - Upload a new media file to R2
 */

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'application/pdf'
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET /api/media - List all media files from D1
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const folder = url.searchParams.get('folder') || null;
  const limit = parseInt(url.searchParams.get('limit')) || 50;
  const offset = parseInt(url.searchParams.get('offset')) || 0;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT * FROM media_library";
    let params = [];
    
    if (folder) {
      query += " WHERE folder = ?";
      params.push(folder);
    }
    
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const stmt = env.DB.prepare(query);
    const { results } = await stmt.bind(...params).all();

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM media_library";
    if (folder) {
      countQuery += " WHERE folder = ?";
    }
    const countStmt = env.DB.prepare(countQuery);
    const countResult = folder 
      ? await countStmt.bind(folder).first()
      : await countStmt.first();

    return new Response(JSON.stringify({
      media: results,
      pagination: {
        total: countResult?.total || 0,
        limit,
        offset,
        hasMore: (offset + results.length) < (countResult?.total || 0)
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

/**
 * POST /api/media - Upload a new media file to R2
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
    
    // Handle multipart form data
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      const folder = formData.get('folder') || 'uploads';
      const altText = formData.get('alt_text') || '';
      const caption = formData.get('caption') || '';
      const postId = formData.get('post_id') || null;

      if (!file || !(file instanceof File)) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate file type
      if (!ALLOWED_MIME_TYPES.includes(file.type)) {
        return new Response(JSON.stringify({ 
          error: "File type not allowed",
          allowed: ALLOWED_MIME_TYPES 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ 
          error: "File too large",
          maxSize: MAX_FILE_SIZE 
        }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }

      // Generate unique filename
      const id = crypto.randomUUID();
      const ext = file.name.split('.').pop() || 'bin';
      const timestamp = Date.now();
      const r2Key = `${folder}/${timestamp}-${id}.${ext}`;

      // Upload to R2
      const fileBuffer = await file.arrayBuffer();
      await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
        httpMetadata: {
          contentType: file.type,
        },
        customMetadata: {
          originalFilename: file.name,
          uploadedAt: new Date().toISOString()
        }
      });

      // Get R2 public URL (you'll need to configure public access for your bucket)
      // For now, we'll construct a relative URL that your app can serve
      const r2Url = `/api/media/serve/${encodeURIComponent(r2Key)}`;

      // Get image dimensions if it's an image
      let width = null;
      let height = null;
      // Note: For actual dimension detection, you'd need a library like sharp
      // For now, we'll leave these null and let the frontend handle it

      // Store metadata in D1
      const now = Date.now();
      await env.DB.prepare(`
        INSERT INTO media_library (
          id, filename, original_filename, mime_type, file_size,
          width, height, r2_key, r2_url, alt_text, caption, folder,
          post_id, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        `${timestamp}-${id}.${ext}`,
        file.name,
        file.type,
        file.size,
        width,
        height,
        r2Key,
        r2Url,
        altText,
        caption,
        folder,
        postId,
        now,
        now
      ).run();

      return new Response(JSON.stringify({
        success: true,
        media: {
          id,
          filename: `${timestamp}-${id}.${ext}`,
          original_filename: file.name,
          mime_type: file.type,
          file_size: file.size,
          r2_key: r2Key,
          r2_url: r2Url,
          url: r2Url,  // Alias for convenience
          alt_text: altText,
          caption,
          folder
        }
      }), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });

    } else {
      return new Response(JSON.stringify({ error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

  } catch (error) {
    console.error('Media upload error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
