/**
 * GET /api/media/check-r2
 * Diagnostic endpoint to check R2 bucket status
 */

export async function onRequestGet(context) {
  const { env } = context;

  const result = {
    bucketConfigured: !!env.MEDIA_BUCKET,
    dbConfigured: !!env.DB,
    files: [],
    error: null
  };

  if (!env.MEDIA_BUCKET) {
    result.error = "MEDIA_BUCKET not configured";
    return new Response(JSON.stringify(result, null, 2), {
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // List objects in R2
    const listed = await env.MEDIA_BUCKET.list({ limit: 20 });
    
    result.files = listed.objects.map(obj => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded
    }));
    
    result.totalInR2 = listed.objects.length;
    result.truncated = listed.truncated;

    // Also check D1 count
    if (env.DB) {
      const countResult = await env.DB.prepare(
        "SELECT COUNT(*) as total FROM media_library"
      ).first();
      result.totalInDB = countResult?.total || 0;
    }

  } catch (error) {
    result.error = error.message;
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { "Content-Type": "application/json" }
  });
}
