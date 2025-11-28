/**
 * Ticket Attachments API
 * POST /api/tickets/:id/attachments - Upload attachment to ticket
 * GET /api/tickets/:id/attachments - List attachments
 */

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv'
];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET - List ticket attachments
 */
export async function onRequestGet(context) {
  const { env, params } = context;
  const ticketId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get ticket
    const ticket = await env.DB.prepare(
      "SELECT id FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results: attachments } = await env.DB.prepare(`
      SELECT * FROM ticket_attachments WHERE ticket_id = ? ORDER BY created_at DESC
    `).bind(ticket.id).all();

    return new Response(JSON.stringify({
      success: true,
      data: { attachments }
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

/**
 * POST - Upload attachment
 */
export async function onRequestPost(context) {
  const { request, env, params } = context;
  const ticketId = params.id;

  if (!env.DB) {
    return new Response(JSON.stringify({ success: false, error: "Database not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (!env.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ success: false, error: "R2 bucket not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // Get ticket
    const ticket = await env.DB.prepare(
      "SELECT * FROM support_tickets WHERE id = ? OR ticket_number = ?"
    ).bind(ticketId, ticketId).first();

    if (!ticket) {
      return new Response(JSON.stringify({ success: false, error: "Ticket not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const contentType = request.headers.get('content-type') || '';
    
    if (!contentType.includes('multipart/form-data')) {
      return new Response(JSON.stringify({ success: false, error: "Content-Type must be multipart/form-data" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') || formData.get('attachment');
    const messageId = formData.get('message_id');
    const uploadedBy = formData.get('uploaded_by') || 'customer';
    const uploadedById = formData.get('uploaded_by_id');

    if (!file || !(file instanceof File)) {
      return new Response(JSON.stringify({ success: false, error: "No file provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "File type not allowed",
        allowed: ALLOWED_TYPES
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Validate file size
    if (file.size > MAX_SIZE) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "File too large. Maximum size is 10MB"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const now = Date.now();
    const attachmentId = `att_${crypto.randomUUID().split('-')[0]}`;
    const ext = file.name.split('.').pop() || 'bin';
    const r2Key = `tickets/${ticket.ticket_number}/${attachmentId}.${ext}`;

    // Upload to R2
    const fileBuffer = await file.arrayBuffer();
    await env.MEDIA_BUCKET.put(r2Key, fileBuffer, {
      httpMetadata: {
        contentType: file.type,
      },
      customMetadata: {
        originalFilename: file.name,
        ticketId: ticket.id,
        ticketNumber: ticket.ticket_number,
        uploadedAt: new Date().toISOString()
      }
    });

    const r2Url = `/api/media/serve/${encodeURIComponent(r2Key)}`;

    // Save to database
    const attachment = {
      id: attachmentId,
      ticket_id: ticket.id,
      message_id: messageId || null,
      filename: `${attachmentId}.${ext}`,
      original_filename: file.name,
      mime_type: file.type,
      file_size: file.size,
      r2_key: r2Key,
      r2_url: r2Url,
      uploaded_by: uploadedById,
      uploaded_by_type: uploadedBy,
      created_at: now
    };

    await env.DB.prepare(`
      INSERT INTO ticket_attachments (
        id, ticket_id, message_id, filename, original_filename, mime_type,
        file_size, r2_key, r2_url, uploaded_by, uploaded_by_type, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      attachment.id, attachment.ticket_id, attachment.message_id,
      attachment.filename, attachment.original_filename, attachment.mime_type,
      attachment.file_size, attachment.r2_key, attachment.r2_url,
      attachment.uploaded_by, attachment.uploaded_by_type, attachment.created_at
    ).run();

    // Update ticket
    await env.DB.prepare(
      "UPDATE support_tickets SET updated_at = ? WHERE id = ?"
    ).bind(now, ticket.id).run();

    return new Response(JSON.stringify({
      success: true,
      data: { attachment }
    }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
