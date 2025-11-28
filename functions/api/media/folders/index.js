/**
 * Media Folders API
 * GET /api/media/folders - List all media folders from R2/media_library
 */

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get distinct folders from media_library
    const { results } = await env.DB.prepare(`
      SELECT DISTINCT folder, COUNT(*) as file_count 
      FROM media_library 
      GROUP BY folder 
      ORDER BY folder ASC
    `).all();

    // Also check R2 bucket if configured
    let r2Folders = [];
    if (env.MEDIA_BUCKET) {
      try {
        // List objects to find folder prefixes
        const listed = await env.MEDIA_BUCKET.list({ delimiter: '/' });
        
        if (listed.delimitedPrefixes) {
          r2Folders = listed.delimitedPrefixes.map(prefix => ({
            folder: prefix.replace(/\/$/, ''),
            source: 'r2'
          }));
        }
      } catch (r2Error) {
        console.error('R2 listing error:', r2Error);
      }
    }

    // Merge results
    const folderMap = new Map();
    
    // Add D1 folders
    results.forEach(row => {
      folderMap.set(row.folder, {
        name: row.folder,
        file_count: row.file_count,
        source: 'database'
      });
    });

    // Add R2 folders not in D1
    r2Folders.forEach(f => {
      if (!folderMap.has(f.folder)) {
        folderMap.set(f.folder, {
          name: f.folder,
          file_count: 0,
          source: 'r2'
        });
      }
    });

    // Add default folders if they don't exist
    const defaultFolders = ['uploads', 'blog-images', 'recipes', 'reviews', 'ai-generated'];
    defaultFolders.forEach(folder => {
      if (!folderMap.has(folder)) {
        folderMap.set(folder, {
          name: folder,
          file_count: 0,
          source: 'default'
        });
      }
    });

    const folders = Array.from(folderMap.values()).sort((a, b) => 
      a.name.localeCompare(b.name)
    );

    return new Response(JSON.stringify(folders), {
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
 * POST /api/media/folders - Create a new folder
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    
    if (!data.name) {
      return new Response(JSON.stringify({ error: "Folder name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Sanitize folder name
    const folderName = data.name
      .toLowerCase()
      .replace(/[^a-z0-9-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Create placeholder file in R2 to establish the folder
    if (env.MEDIA_BUCKET) {
      try {
        await env.MEDIA_BUCKET.put(`${folderName}/.folder`, '', {
          customMetadata: { created: new Date().toISOString() }
        });
      } catch (r2Error) {
        console.error('R2 folder creation error:', r2Error);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      folder: { name: folderName, file_count: 0 }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
