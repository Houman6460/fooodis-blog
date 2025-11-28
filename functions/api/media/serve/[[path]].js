/**
 * Media Serve API - Serves files from R2
 * GET /api/media/serve/:path - Serve a file from R2 bucket
 */

export async function onRequestGet(context) {
  const { env, params, request } = context;

  if (!env.MEDIA_BUCKET) {
    return new Response("R2 bucket not configured", { status: 500 });
  }

  try {
    // Get the path from the URL
    const path = params.path ? params.path.join('/') : '';
    
    if (!path) {
      return new Response("File path required", { status: 400 });
    }

    // Decode the path in case it was URL encoded
    const r2Key = decodeURIComponent(path);

    // Get object from R2
    const object = await env.MEDIA_BUCKET.get(r2Key);

    if (!object) {
      return new Response("File not found", { status: 404 });
    }

    // Get the content type from object metadata or infer from extension
    const contentType = object.httpMetadata?.contentType || inferContentType(r2Key);

    // Create response headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000"); // Cache for 1 year
    headers.set("ETag", object.httpEtag);
    
    // Handle conditional requests
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }

    // Add CORS headers
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");

    return new Response(object.body, { headers });

  } catch (error) {
    console.error('Media serve error:', error);
    return new Response(error.message, { status: 500 });
  }
}

/**
 * Handle OPTIONS for CORS
 */
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    }
  });
}

/**
 * Infer content type from file extension
 */
function inferContentType(filename) {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'svg': 'image/svg+xml',
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'pdf': 'application/pdf',
    'json': 'application/json',
    'txt': 'text/plain',
    'html': 'text/html',
    'css': 'text/css',
    'js': 'application/javascript'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}
