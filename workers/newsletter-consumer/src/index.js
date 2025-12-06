/**
 * Fooodis Newsletter Queue Consumer
 * 
 * Processes newsletter messages from the queue and sends emails
 * Supports multiple email providers (Mailgun, SendGrid, Resend)
 * 
 * Deploy: cd workers/newsletter-consumer && wrangler deploy
 */

export default {
  /**
   * Queue consumer handler - processes batches of messages
   */
  async queue(batch, env) {
    console.log(`📧 Processing ${batch.messages.length} newsletter messages`);

    for (const message of batch.messages) {
      try {
        const { type, jobId, subject, content, recipients } = message.body;

        if (type === 'send_newsletter') {
          await this.processNewsletterBatch(env, jobId, subject, content, recipients);
          message.ack();
        } else {
          console.warn(`Unknown message type: ${type}`);
          message.ack();
        }
      } catch (error) {
        console.error('Error processing message:', error);
        // Retry up to max_retries times
        message.retry();
      }
    }
  },

  /**
   * Process a batch of newsletter recipients
   */
  async processNewsletterBatch(env, jobId, subject, content, recipients) {
    console.log(`📨 Sending to ${recipients.length} recipients for job ${jobId}`);

    let sentCount = 0;
    let failedCount = 0;

    // Update job status to processing
    if (env.DB) {
      await env.DB.prepare(
        "UPDATE newsletter_jobs SET status = 'processing', started_at = ? WHERE id = ?"
      ).bind(Date.now(), jobId).run();
    }

    for (const recipient of recipients) {
      try {
        const result = await this.sendEmail(env, {
          to: recipient.email,
          toName: recipient.name,
          subject,
          html: this.personalizeContent(content, recipient)
        });

        if (result.success) {
          sentCount++;
          // Log successful send
          await this.logSend(env, jobId, recipient.email, 'sent');
        } else {
          failedCount++;
          await this.logSend(env, jobId, recipient.email, 'failed', result.error);
        }
      } catch (error) {
        failedCount++;
        await this.logSend(env, jobId, recipient.email, 'failed', error.message);
        console.error(`Failed to send to ${recipient.email}:`, error.message);
      }

      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Update job progress
    if (env.DB) {
      await env.DB.prepare(`
        UPDATE newsletter_jobs 
        SET sent_count = sent_count + ?, 
            failed_count = failed_count + ?,
            updated_at = ?
        WHERE id = ?
      `).bind(sentCount, failedCount, Date.now(), jobId).run();

      // Check if job is complete
      const job = await env.DB.prepare(
        "SELECT total_recipients, sent_count, failed_count FROM newsletter_jobs WHERE id = ?"
      ).bind(jobId).first();

      if (job && (job.sent_count + job.failed_count) >= job.total_recipients) {
        await env.DB.prepare(
          "UPDATE newsletter_jobs SET status = 'completed', completed_at = ? WHERE id = ?"
        ).bind(Date.now(), jobId).run();
        console.log(`✅ Job ${jobId} completed`);
      }
    }

    console.log(`📧 Batch complete: ${sentCount} sent, ${failedCount} failed`);
  },

  /**
   * Send email using configured provider
   */
  async sendEmail(env, { to, toName, subject, html }) {
    // Get email provider configuration from KV or env
    const provider = env.EMAIL_PROVIDER || 'console';
    
    switch (provider) {
      case 'mailgun':
        return await this.sendViaMailgun(env, { to, toName, subject, html });
      case 'sendgrid':
        return await this.sendViaSendGrid(env, { to, toName, subject, html });
      case 'resend':
        return await this.sendViaResend(env, { to, toName, subject, html });
      case 'console':
      default:
        // Development mode - just log
        console.log(`📧 [DEV] Would send to ${to}: ${subject}`);
        return { success: true, provider: 'console' };
    }
  },

  /**
   * Send via Mailgun
   */
  async sendViaMailgun(env, { to, toName, subject, html }) {
    const apiKey = env.MAILGUN_API_KEY;
    const domain = env.MAILGUN_DOMAIN || 'mg.fooodis.com';
    const from = env.EMAIL_FROM || 'Fooodis <newsletter@fooodis.com>';

    if (!apiKey) {
      return { success: false, error: 'Mailgun API key not configured' };
    }

    const formData = new FormData();
    formData.append('from', from);
    formData.append('to', toName ? `${toName} <${to}>` : to);
    formData.append('subject', subject);
    formData.append('html', html);

    const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`api:${apiKey}`)}`
      },
      body: formData
    });

    if (response.ok) {
      return { success: true, provider: 'mailgun' };
    } else {
      const error = await response.text();
      return { success: false, error, provider: 'mailgun' };
    }
  },

  /**
   * Send via SendGrid
   */
  async sendViaSendGrid(env, { to, toName, subject, html }) {
    const apiKey = env.SENDGRID_API_KEY;
    const from = env.EMAIL_FROM || 'newsletter@fooodis.com';

    if (!apiKey) {
      return { success: false, error: 'SendGrid API key not configured' };
    }

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to, name: toName }]
        }],
        from: { email: from, name: 'Fooodis' },
        subject,
        content: [{ type: 'text/html', value: html }]
      })
    });

    if (response.ok || response.status === 202) {
      return { success: true, provider: 'sendgrid' };
    } else {
      const error = await response.text();
      return { success: false, error, provider: 'sendgrid' };
    }
  },

  /**
   * Send via Resend
   */
  async sendViaResend(env, { to, toName, subject, html }) {
    const apiKey = env.RESEND_API_KEY;
    const from = env.EMAIL_FROM || 'Fooodis <newsletter@fooodis.com>';

    if (!apiKey) {
      return { success: false, error: 'Resend API key not configured' };
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html
      })
    });

    if (response.ok) {
      return { success: true, provider: 'resend' };
    } else {
      const error = await response.text();
      return { success: false, error, provider: 'resend' };
    }
  },

  /**
   * Personalize email content with recipient data
   */
  personalizeContent(content, recipient) {
    let personalized = content;
    
    // Replace placeholders
    personalized = personalized.replace(/\{\{name\}\}/g, recipient.name || 'Subscriber');
    personalized = personalized.replace(/\{\{email\}\}/g, recipient.email);
    personalized = personalized.replace(/\{\{subscriber_id\}\}/g, recipient.id || '');
    
    // Add unsubscribe link
    const unsubscribeUrl = `https://fooodis.com/unsubscribe?id=${recipient.id}&email=${encodeURIComponent(recipient.email)}`;
    personalized = personalized.replace(/\{\{unsubscribe_url\}\}/g, unsubscribeUrl);

    return personalized;
  },

  /**
   * Log email send attempt
   */
  async logSend(env, jobId, email, status, error = null) {
    if (!env.DB) return;

    try {
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS newsletter_sends (
          id TEXT PRIMARY KEY,
          job_id TEXT NOT NULL,
          email TEXT NOT NULL,
          status TEXT NOT NULL,
          error TEXT,
          sent_at INTEGER
        )
      `).run();
    } catch (e) { /* Table exists */ }

    await env.DB.prepare(`
      INSERT INTO newsletter_sends (id, job_id, email, status, error, sent_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(
      `send_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      jobId,
      email,
      status,
      error,
      Date.now()
    ).run();
  },

  /**
   * HTTP handler for status checks
   */
  async fetch(request, env) {
    return new Response(JSON.stringify({
      service: 'Fooodis Newsletter Consumer',
      status: 'active',
      provider: env.EMAIL_PROVIDER || 'console',
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
