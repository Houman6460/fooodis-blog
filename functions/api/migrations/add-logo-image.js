/**
 * Migration: Add logo_image column to email_popup_config
 * Run this once to update existing databases
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
    // Check if column already exists
    const tableInfo = await env.DB.prepare(
      "PRAGMA table_info(email_popup_config)"
    ).all();
    
    const hasLogoImage = tableInfo.results?.some(col => col.name === 'logo_image');
    
    if (hasLogoImage) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: "logo_image column already exists" 
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Add the column
    await env.DB.prepare(
      "ALTER TABLE email_popup_config ADD COLUMN logo_image TEXT"
    ).run();

    return new Response(JSON.stringify({ 
      success: true, 
      message: "logo_image column added successfully" 
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
