/**
 * Newsletter Queue API
 * POST /api/newsletter/queue - Queue a newsletter for async sending
 * GET /api/newsletter/queue - Get queue status
 * 
 * Uses Cloudflare Queues for reliable async processing
 * Falls back to synchronous processing if Queues not configured
 */

/**
 * POST /api/newsletter/queue - Queue newsletter for sending
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const {
      subject,
      content,
      templateId,
      recipients,      // 'all', 'active', or array of email IDs
      scheduledAt,     // Optional: schedule for later
      campaignName
    } = data;

    if (!subject || !content) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Subject and content are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = Date.now();
    const jobId = `newsletter_${now}_${Math.random().toString(36).substr(2, 9)}`;

    // Get recipient list
    let recipientList = [];
    if (env.DB) {
      if (recipients === 'all') {
        const { results } = await env.DB.prepare(
          "SELECT id, email, name FROM email_subscribers WHERE status != 'unsubscribed'"
        ).all();
        recipientList = results || [];
      } else if (recipients === 'active') {
        const { results } = await env.DB.prepare(
          "SELECT id, email, name FROM email_subscribers WHERE status = 'active'"
        ).all();
        recipientList = results || [];
      } else if (Array.isArray(recipients)) {
        const placeholders = recipients.map(() => '?').join(',');
        const { results } = await env.DB.prepare(
          `SELECT id, email, name FROM email_subscribers WHERE id IN (${placeholders})`
        ).bind(...recipients).all();
        recipientList = results || [];
      }
    }

    if (recipientList.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        error: 'No recipients found'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Create newsletter job record
    if (env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS newsletter_jobs (
            id TEXT PRIMARY KEY,
            campaign_name TEXT,
            subject TEXT NOT NULL,
            content TEXT NOT NULL,
            template_id TEXT,
            total_recipients INTEGER DEFAULT 0,
            sent_count INTEGER DEFAULT 0,
            failed_count INTEGER DEFAULT 0,
            status TEXT DEFAULT 'queued',
            scheduled_at INTEGER,
            started_at INTEGER,
            completed_at INTEGER,
            created_at INTEGER,
            updated_at INTEGER
          )
        `).run();
      } catch (e) { /* Table exists */ }

      await env.DB.prepare(`
        INSERT INTO newsletter_jobs (
          id, campaign_name, subject, content, template_id,
          total_recipients, status, scheduled_at, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'queued', ?, ?, ?)
      `).bind(
        jobId,
        campaignName || `Campaign ${new Date().toISOString().split('T')[0]}`,
        subject,
        content,
        templateId || null,
        recipientList.length,
        scheduledAt || null,
        now,
        now
      ).run();
    }

    // Queue messages using Cloudflare Queues if available
    if (env.NEWSLETTER_QUEUE) {
      console.log(`📧 Queueing ${recipientList.length} emails via Cloudflare Queues`);
      
      // Batch recipients into chunks
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < recipientList.length; i += batchSize) {
        batches.push(recipientList.slice(i, i + batchSize));
      }

      // Queue each batch
      for (const batch of batches) {
        await env.NEWSLETTER_QUEUE.send({
          type: 'send_newsletter',
          jobId,
          subject,
          content,
          recipients: batch,
          timestamp: now
        });
      }

      return new Response(JSON.stringify({
        success: true,
        jobId,
        queued: recipientList.length,
        batches: batches.length,
        message: `Newsletter queued for ${recipientList.length} recipients`
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fallback: Store for later processing (sync mode)
    console.log(`📧 Queue not available, storing job for manual processing`);
    
    // Store recipient list in KV for manual processing
    if (env.KV) {
      await env.KV.put(`newsletter_job:${jobId}`, JSON.stringify({
        jobId,
        subject,
        content,
        recipients: recipientList,
        status: 'pending_manual'
      }), { expirationTtl: 86400 * 7 }); // 7 days
    }

    return new Response(JSON.stringify({
      success: true,
      jobId,
      recipients: recipientList.length,
      mode: 'manual',
      message: 'Newsletter stored for processing (Queues not configured)'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Newsletter queue error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/newsletter/queue - Get queue/job status
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!env.DB) {
    return new Response(JSON.stringify({
      error: 'Database not configured'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    if (jobId) {
      // Get specific job status
      const job = await env.DB.prepare(
        "SELECT * FROM newsletter_jobs WHERE id = ?"
      ).bind(jobId).first();

      if (!job) {
        return new Response(JSON.stringify({
          success: false,
          error: 'Job not found'
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({
        success: true,
        job
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get recent jobs
    const { results: jobs } = await env.DB.prepare(`
      SELECT * FROM newsletter_jobs
      ORDER BY created_at DESC
      LIMIT 20
    `).all();

    // Get queue stats
    const stats = await env.DB.prepare(`
      SELECT 
        COUNT(*) as total_jobs,
        SUM(CASE WHEN status = 'queued' THEN 1 ELSE 0 END) as queued,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(total_recipients) as total_recipients,
        SUM(sent_count) as total_sent
      FROM newsletter_jobs
    `).first();

    return new Response(JSON.stringify({
      success: true,
      stats: stats || {},
      recentJobs: jobs || []
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Queue status error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
