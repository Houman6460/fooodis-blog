/**
 * Media Bulk Operations API
 * POST /api/media/bulk - Perform bulk operations on media files
 * 
 * Operations:
 * - delete: Delete multiple media files
 * - move: Move multiple files to a folder
 * - update: Update metadata for multiple files
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
    const { operation, ids, options } = data;

    if (!operation) {
      return new Response(JSON.stringify({ error: "Operation is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: "Media IDs array is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const results = {
      operation,
      total: ids.length,
      success: 0,
      failed: 0,
      details: []
    };

    switch (operation) {
      case 'delete':
        for (const id of ids) {
          try {
            // Get media record to find R2 key
            const media = await env.DB.prepare(
              "SELECT r2_key, thumbnail_key FROM media_library WHERE id = ?"
            ).bind(id).first();

            if (media) {
              // Delete from R2
              if (env.MEDIA_BUCKET && media.r2_key) {
                try {
                  await env.MEDIA_BUCKET.delete(media.r2_key);
                  if (media.thumbnail_key) {
                    await env.MEDIA_BUCKET.delete(media.thumbnail_key);
                  }
                } catch (r2Error) {
                  console.error('R2 delete error:', r2Error);
                }
              }

              // Delete from D1
              await env.DB.prepare(
                "DELETE FROM media_library WHERE id = ?"
              ).bind(id).run();

              results.success++;
              results.details.push({ id, status: 'deleted' });
            } else {
              results.failed++;
              results.details.push({ id, status: 'not_found' });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: 'error', error: err.message });
          }
        }
        break;

      case 'move':
        const targetFolder = options?.folder;
        if (!targetFolder) {
          return new Response(JSON.stringify({ error: "Target folder is required for move operation" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        const now = Date.now();
        for (const id of ids) {
          try {
            const result = await env.DB.prepare(
              "UPDATE media_library SET folder = ?, updated_at = ? WHERE id = ?"
            ).bind(targetFolder, now, id).run();

            if (result.meta.changes > 0) {
              results.success++;
              results.details.push({ id, status: 'moved', folder: targetFolder });
            } else {
              results.failed++;
              results.details.push({ id, status: 'not_found' });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: 'error', error: err.message });
          }
        }
        break;

      case 'update':
        const updates = options?.updates || {};
        if (Object.keys(updates).length === 0) {
          return new Response(JSON.stringify({ error: "Updates object is required" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        // Build update query
        const allowedFields = ['alt_text', 'caption', 'folder', 'is_featured'];
        const setClauses = [];
        const values = [];

        for (const [key, value] of Object.entries(updates)) {
          if (allowedFields.includes(key)) {
            setClauses.push(`${key} = ?`);
            values.push(key === 'is_featured' ? (value ? 1 : 0) : value);
          }
        }

        if (setClauses.length === 0) {
          return new Response(JSON.stringify({ error: "No valid fields to update" }), {
            status: 400,
            headers: { "Content-Type": "application/json" }
          });
        }

        setClauses.push('updated_at = ?');
        values.push(Date.now());

        for (const id of ids) {
          try {
            const result = await env.DB.prepare(
              `UPDATE media_library SET ${setClauses.join(', ')} WHERE id = ?`
            ).bind(...values, id).run();

            if (result.meta.changes > 0) {
              results.success++;
              results.details.push({ id, status: 'updated' });
            } else {
              results.failed++;
              results.details.push({ id, status: 'not_found' });
            }
          } catch (err) {
            results.failed++;
            results.details.push({ id, status: 'error', error: err.message });
          }
        }
        break;

      default:
        return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
    }

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
