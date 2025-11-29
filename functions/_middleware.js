/**
 * Global middleware for all Cloudflare Pages Functions
 * Handles CORS and common response headers
 */

// Helper to add CORS headers
function addCorsHeaders(response, request) {
  const headers = new Headers(response.headers);
  
  // Get origin from request or use wildcard
  const origin = request.headers.get('Origin') || '*';
  
  headers.set('Access-Control-Allow-Origin', origin);
  headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  headers.set('Access-Control-Allow-Credentials', 'true');
  headers.set('Access-Control-Max-Age', '86400');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

// Handle preflight OPTIONS requests
function handleOptions(request) {
  const origin = request.headers.get('Origin') || '*';
  
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400'
    }
  });
}

export async function onRequest(context) {
  const { request, next } = context;
  
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  try {
    // Continue to the next handler
    const response = await next();
    
    // Add CORS headers to response
    return addCorsHeaders(response, request);
  } catch (error) {
    // Return error with CORS headers
    const errorResponse = new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
    return addCorsHeaders(errorResponse, request);
  }
}
