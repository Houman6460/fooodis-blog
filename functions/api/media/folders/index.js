/**
 * Media Folders API
 * GET /api/media/folders - List all media folders
 * POST /api/media/folders - Create a new folder
 * 
 * Integrates with:
 * - Media Library section
 * - AI Content Automation (folder selection)
 * - Create New Blog Post (featured image organization)
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
    // First, try to get folders from media_folders table
    let definedFolders = [];
    try {
      const { results } = await env.DB.prepare(
        "SELECT * FROM media_folders ORDER BY is_system DESC, name ASC"
      ).all();
      definedFolders = results || [];
    } catch (e) {
      // Table might not exist yet
      console.log('media_folders table not available, using fallback');
    }

    // Get file counts from media_library
    const { results: fileCounts } = await env.DB.prepare(`
      SELECT folder, COUNT(*) as file_count, SUM(file_size) as total_size
      FROM media_library 
      GROUP BY folder
    `).all();

    const fileCountMap = new Map();
    fileCounts.forEach(row => {
      fileCountMap.set(row.folder, {
        file_count: row.file_count,
        total_size: row.total_size || 0
      });
    });

    // Merge defined folders with file counts
    const folderMap = new Map();

    // Add defined folders
    definedFolders.forEach(folder => {
      const counts = fileCountMap.get(folder.name) || { file_count: 0, total_size: 0 };
      folderMap.set(folder.name, {
        id: folder.id,
        name: folder.name,
        display_name: folder.display_name || folder.name,
        description: folder.description,
        file_count: counts.file_count,
        total_size: counts.total_size,
        color: folder.color,
        icon: folder.icon,
        is_system: folder.is_system === 1
      });
    });

    // Add folders from file counts that aren't in defined folders
    fileCounts.forEach(row => {
      if (!folderMap.has(row.folder)) {
        folderMap.set(row.folder, {
          name: row.folder,
          display_name: row.folder,
          file_count: row.file_count,
          total_size: row.total_size || 0,
          is_system: false
        });
      }
    });

    // Also check R2 bucket if configured
    if (env.MEDIA_BUCKET) {
      try {
        const listed = await env.MEDIA_BUCKET.list({ delimiter: '/' });
        
        if (listed.delimitedPrefixes) {
          listed.delimitedPrefixes.forEach(prefix => {
            const folderName = prefix.replace(/\/$/, '');
            if (!folderMap.has(folderName)) {
              folderMap.set(folderName, {
                name: folderName,
                display_name: folderName,
                file_count: 0,
                total_size: 0,
                source: 'r2',
                is_system: false
              });
            }
          });
        }
      } catch (r2Error) {
        console.error('R2 listing error:', r2Error);
      }
    }

    // Ensure default folders exist
    const defaultFolders = [
      { name: 'uploads', display_name: 'Uploads', is_system: true },
      { name: 'blog-images', display_name: 'Blog Images', is_system: true },
      { name: 'ai-generated', display_name: 'AI Generated', is_system: true },
      { name: 'featured', display_name: 'Featured', is_system: true }
    ];
    
    defaultFolders.forEach(df => {
      if (!folderMap.has(df.name)) {
        folderMap.set(df.name, {
          name: df.name,
          display_name: df.display_name,
          file_count: 0,
          total_size: 0,
          is_system: df.is_system
        });
      }
    });

    const folders = Array.from(folderMap.values()).sort((a, b) => {
      // System folders first, then alphabetically
      if (a.is_system && !b.is_system) return -1;
      if (!a.is_system && b.is_system) return 1;
      return a.name.localeCompare(b.name);
    });

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

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

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

    const displayName = data.display_name || data.name;
    const now = Date.now();
    const id = `folder_${crypto.randomUUID().split('-')[0]}`;

    // Try to insert into media_folders table
    try {
      await env.DB.prepare(`
        INSERT INTO media_folders (id, name, display_name, description, color, icon, is_system, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)
      `).bind(
        id,
        folderName,
        displayName,
        data.description || '',
        data.color || '#478ac9',
        data.icon || 'folder',
        now,
        now
      ).run();
    } catch (dbError) {
      // If table doesn't exist or duplicate, continue
      if (dbError.message?.includes('UNIQUE')) {
        return new Response(JSON.stringify({ error: "Folder already exists" }), {
          status: 409,
          headers: { "Content-Type": "application/json" }
        });
      }
      console.log('Could not insert into media_folders:', dbError.message);
    }

    // Create placeholder file in R2 to establish the folder
    if (env.MEDIA_BUCKET) {
      try {
        await env.MEDIA_BUCKET.put(`${folderName}/.folder`, '', {
          customMetadata: { 
            created: new Date().toISOString(),
            display_name: displayName
          }
        });
      } catch (r2Error) {
        console.error('R2 folder creation error:', r2Error);
      }
    }

    // Dispatch event for cross-module sync
    const folder = {
      id,
      name: folderName,
      display_name: displayName,
      description: data.description || '',
      file_count: 0,
      total_size: 0,
      is_system: false
    };

    return new Response(JSON.stringify({ 
      success: true, 
      folder
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

/**
 * DELETE /api/media/folders - Delete a folder (move files to uploads)
 */
export async function onRequestDelete(context) {
  const { request, env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    const url = new URL(request.url);
    const folderName = url.searchParams.get('name');

    if (!folderName) {
      return new Response(JSON.stringify({ error: "Folder name is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if it's a system folder
    try {
      const folder = await env.DB.prepare(
        "SELECT is_system FROM media_folders WHERE name = ?"
      ).bind(folderName).first();

      if (folder && folder.is_system === 1) {
        return new Response(JSON.stringify({ error: "Cannot delete system folder" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
    } catch (e) {
      // Table might not exist
    }

    // Move all files in this folder to 'uploads'
    await env.DB.prepare(
      "UPDATE media_library SET folder = 'uploads', updated_at = ? WHERE folder = ?"
    ).bind(Date.now(), folderName).run();

    // Delete from media_folders table
    try {
      await env.DB.prepare(
        "DELETE FROM media_folders WHERE name = ? AND is_system = 0"
      ).bind(folderName).run();
    } catch (e) {
      // Table might not exist
    }

    // Try to delete placeholder from R2
    if (env.MEDIA_BUCKET) {
      try {
        await env.MEDIA_BUCKET.delete(`${folderName}/.folder`);
      } catch (r2Error) {
        // Ignore
      }
    }

    return new Response(JSON.stringify({ success: true, folder: folderName }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
