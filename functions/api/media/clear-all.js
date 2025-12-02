/**
 * DELETE /api/media/clear-all
 * Clear all media from both D1 database and R2 storage
 * USE WITH CAUTION - This deletes everything!
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
    // Get all media items to delete from R2
    const mediaResult = await env.DB.prepare(
      "SELECT id, r2_key FROM media_library"
    ).all();
    
    const mediaItems = mediaResult.results || [];
    let r2Deleted = 0;
    let r2Failed = 0;

    // Delete from R2 if bucket is configured
    if (env.MEDIA_BUCKET && mediaItems.length > 0) {
      for (const item of mediaItems) {
        if (item.r2_key) {
          try {
            await env.MEDIA_BUCKET.delete(item.r2_key);
            r2Deleted++;
          } catch (err) {
            console.error(`Failed to delete R2 object: ${item.r2_key}`, err);
            r2Failed++;
          }
        }
      }
    }

    // Delete all from D1 database
    await env.DB.prepare("DELETE FROM media_library").run();
    
    // Also clear used_images table if it exists
    try {
      await env.DB.prepare("DELETE FROM used_images").run();
    } catch (e) {
      // Table might not exist, ignore
    }

    return new Response(JSON.stringify({
      success: true,
      message: "All media cleared",
      deleted: {
        database: mediaItems.length,
        r2: r2Deleted,
        r2Failed: r2Failed
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
