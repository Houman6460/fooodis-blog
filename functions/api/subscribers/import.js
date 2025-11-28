/**
 * Subscribers Import/Export API
 * POST /api/subscribers/import - Import subscribers from CSV
 * GET /api/subscribers/import?export=true - Export subscribers to CSV
 */

/**
 * GET - Export subscribers as CSV
 */
export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const status = url.searchParams.get('status'); // Filter by status

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    let query = "SELECT email, name, status, source, subscribed_at, country FROM email_subscribers";
    const params = [];

    if (status) {
      query += " WHERE status = ?";
      params.push(status);
    }

    query += " ORDER BY subscribed_at DESC";

    const stmt = env.DB.prepare(query);
    const { results } = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();

    // Generate CSV
    const headers = ['email', 'name', 'status', 'source', 'subscribed_at', 'country'];
    let csv = headers.join(',') + '\n';

    results.forEach(row => {
      const values = headers.map(h => {
        let val = row[h] || '';
        if (h === 'subscribed_at' && val) {
          val = new Date(val).toISOString();
        }
        // Escape commas and quotes
        if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
          val = '"' + val.replace(/"/g, '""') + '"';
        }
        return val;
      });
      csv += values.join(',') + '\n';
    });

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST - Import subscribers from CSV
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
    const contentType = request.headers.get('content-type') || '';
    let csvData;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file');
      if (!file) {
        return new Response(JSON.stringify({ error: "No file provided" }), {
          status: 400,
          headers: { "Content-Type": "application/json" }
        });
      }
      csvData = await file.text();
    } else if (contentType.includes('text/csv') || contentType.includes('application/json')) {
      const data = await request.json();
      csvData = data.csv;
    } else {
      csvData = await request.text();
    }

    if (!csvData) {
      return new Response(JSON.stringify({ error: "No CSV data provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Parse CSV
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return new Response(JSON.stringify({ error: "CSV must have header and at least one data row" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
    const emailIndex = headers.indexOf('email');

    if (emailIndex === -1) {
      return new Response(JSON.stringify({ error: "CSV must have an 'email' column" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const nameIndex = headers.indexOf('name');
    const tagsIndex = headers.indexOf('tags');
    const now = Date.now();

    const results = {
      total: 0,
      imported: 0,
      skipped: 0,
      errors: []
    };

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      results.total++;
      const values = parseCSVLine(lines[i]);
      const email = values[emailIndex]?.toLowerCase().trim();

      if (!email) {
        results.skipped++;
        continue;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        results.errors.push({ line: i + 1, email, error: 'Invalid email format' });
        results.skipped++;
        continue;
      }

      try {
        const id = `sub_${crypto.randomUUID().split('-')[0]}`;
        const name = nameIndex !== -1 ? values[nameIndex]?.trim() || null : null;
        const tags = tagsIndex !== -1 ? values[tagsIndex]?.trim() || null : null;

        await env.DB.prepare(`
          INSERT INTO email_subscribers (id, email, name, status, source, tags, subscribed_at, created_at, updated_at)
          VALUES (?, ?, ?, 'active', 'import', ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            name = COALESCE(excluded.name, email_subscribers.name),
            tags = COALESCE(excluded.tags, email_subscribers.tags),
            updated_at = excluded.updated_at
        `).bind(id, email, name, tags ? JSON.stringify([tags]) : null, now, now, now).run();

        results.imported++;
      } catch (err) {
        results.errors.push({ line: i + 1, email, error: err.message });
        results.skipped++;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results
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
 * Parse a CSV line handling quoted values
 */
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current);
  return result;
}
