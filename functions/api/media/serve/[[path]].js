/**
 * Media Serve API - Serves files from R2
 * GET /api/media/serve/* - Serve a file from R2 bucket
 */

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: "R2 bucket not configured" }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get the path from the URL
    const url = new URL(request.url);
    const fullPath = url.pathname;
    
    // Remove /api/media/serve/ prefix to get the R2 key
    const r2Key = decodeURIComponent(fullPath.replace('/api/media/serve/', ''));
    
    if (!r2Key) {
      return new Response(JSON.stringify({ error: "File path required" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    console.log('Media serve: Fetching from R2:', r2Key);

    // Get object from R2
    const object = await env.MEDIA_BUCKET.get(r2Key);

    if (!object) {
      console.log('Media serve: File not found:', r2Key);
      return new Response(JSON.stringify({ error: "File not found", key: r2Key }), { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get the content type from object metadata or infer from extension
    const contentType = object.httpMetadata?.contentType || inferContentType(r2Key);

    // Create response headers
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Cache-Control", "public, max-age=31536000");
    headers.set("ETag", object.httpEtag);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
    
    // Handle conditional requests
    const ifNoneMatch = request.headers.get("If-None-Match");
    if (ifNoneMatch === object.httpEtag) {
      return new Response(null, { status: 304, headers });
    }

    return new Response(object.body, { headers });

  } catch (error) {
    console.error('Media serve error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
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
