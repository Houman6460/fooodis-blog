/**
 * Migration: Update email_popup_config table to new schema
 * Adds missing columns and updates button_color to yellow
 */

export async function onRequestGet(context) {
  const { env } = context;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const results = [];

  try {
    // Get current table info
    const tableInfo = await env.DB.prepare(
      "PRAGMA table_info(email_popup_config)"
    ).all();
    
    const existingColumns = tableInfo.results?.map(col => col.name) || [];
    results.push({ existingColumns });

    // Columns to add
    const columnsToAdd = [
      { name: 'placeholder_text', type: 'TEXT', default: "'Enter your email address'" },
      { name: 'trigger_type', type: 'TEXT', default: "'time'" },
      { name: 'trigger_delay', type: 'INTEGER', default: '5' },
      { name: 'trigger_scroll_percent', type: 'INTEGER', default: '50' },
      { name: 'show_once', type: 'INTEGER', default: '1' },
      { name: 'show_every_days', type: 'INTEGER', default: '7' },
      { name: 'popup_image', type: 'TEXT', default: null },
      { name: 'logo_image', type: 'TEXT', default: null }
    ];

    for (const col of columnsToAdd) {
      if (!existingColumns.includes(col.name)) {
        try {
          const defaultValue = col.default ? ` DEFAULT ${col.default}` : '';
          await env.DB.prepare(
            `ALTER TABLE email_popup_config ADD COLUMN ${col.name} ${col.type}${defaultValue}`
          ).run();
          results.push({ added: col.name });
        } catch (e) {
          results.push({ error: `Failed to add ${col.name}: ${e.message}` });
        }
      }
    }

    // Update button_color to yellow for existing config
    await env.DB.prepare(`
      UPDATE email_popup_config 
      SET button_color = '#e8f24c', 
          background_color = '#1e1e24',
          text_color = '#e0e0e0',
          updated_at = ?
      WHERE id = 'default'
    `).bind(Date.now()).run();
    results.push({ updated: 'colors to Fooodis theme' });

    // Fetch updated config
    const config = await env.DB.prepare(
      "SELECT * FROM email_popup_config WHERE id = 'default'"
    ).first();

    return new Response(JSON.stringify({ 
      success: true, 
      results,
      config
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      results 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
