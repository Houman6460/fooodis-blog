/**
 * Fooodis Automation Scheduler Worker
 * 
 * This worker runs on a schedule to:
 * 1. Check for scheduled blog posts and publish them
 * 2. Trigger AI blog post generation based on automation paths
 * 3. Send scheduled newsletters
 * 4. Clean up expired data
 * 
 * Deploy separately from main Pages site:
 * cd workers/automation-scheduler && wrangler deploy
 */

export default {
  /**
   * Handle scheduled cron triggers
   */
  async scheduled(event, env, ctx) {
    console.log(`🕐 Cron trigger: ${event.cron} at ${new Date().toISOString()}`);
    
    ctx.waitUntil(
      Promise.all([
        this.publishScheduledPosts(env),
        this.runAutomationPaths(env),
        this.cleanupExpiredData(env),
      ])
    );
  },

  /**
   * HTTP handler for manual triggers
   */
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // Simple auth check
    const authHeader = request.headers.get('Authorization');
    const expectedKey = await env.KV?.get('AUTOMATION_API_KEY');
    
    if (expectedKey && authHeader !== `Bearer ${expectedKey}`) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Route handlers
    if (url.pathname === '/trigger/publish') {
      const result = await this.publishScheduledPosts(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/trigger/automation') {
      const result = await this.runAutomationPaths(env);
      return new Response(JSON.stringify(result), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (url.pathname === '/status') {
      return new Response(JSON.stringify({
        status: 'active',
        timestamp: new Date().toISOString(),
        bindings: {
          db: !!env.DB,
          kv: !!env.KV,
          r2: !!env.MEDIA_BUCKET
        }
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      service: 'Fooodis Automation Scheduler',
      endpoints: [
        'GET /status - Check worker status',
        'POST /trigger/publish - Trigger scheduled post publishing',
        'POST /trigger/automation - Trigger automation paths'
      ]
    }), {
      headers: { 'Content-Type': 'application/json' }
    });
  },

  /**
   * Publish scheduled blog posts that are due
   */
  async publishScheduledPosts(env) {
    if (!env.DB) {
      console.log('⚠️ Database not available');
      return { success: false, error: 'Database not configured' };
    }

    try {
      const now = Date.now();
      
      // Find posts that are scheduled and due for publishing
      const { results: scheduledPosts } = await env.DB.prepare(`
        SELECT id, title, scheduled_date 
        FROM blog_posts 
        WHERE status = 'scheduled' 
          AND scheduled_date IS NOT NULL 
          AND scheduled_date <= ?
        ORDER BY scheduled_date ASC
        LIMIT 10
      `).bind(now).all();

      if (!scheduledPosts || scheduledPosts.length === 0) {
        console.log('📝 No scheduled posts due for publishing');
        return { success: true, published: 0 };
      }

      let publishedCount = 0;
      const publishedPosts = [];

      for (const post of scheduledPosts) {
        try {
          await env.DB.prepare(`
            UPDATE blog_posts 
            SET status = 'published', 
                published_date = ?,
                updated_at = ?
            WHERE id = ?
          `).bind(now, now, post.id).run();

          publishedCount++;
          publishedPosts.push({ id: post.id, title: post.title });
          console.log(`✅ Published: ${post.title}`);
        } catch (err) {
          console.error(`❌ Failed to publish ${post.id}:`, err.message);
        }
      }

      // Log activity
      await this.logActivity(env, 'auto_publish', {
        count: publishedCount,
        posts: publishedPosts.map(p => p.title)
      });

      return { 
        success: true, 
        published: publishedCount, 
        posts: publishedPosts 
      };
    } catch (error) {
      console.error('❌ Error publishing scheduled posts:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Run automation paths for AI content generation
   */
  async runAutomationPaths(env) {
    if (!env.KV) {
      return { success: false, error: 'KV not configured' };
    }

    try {
      // Get automation paths from KV
      const pathsJson = await env.KV.get('automation-paths');
      if (!pathsJson) {
        console.log('📋 No automation paths configured');
        return { success: true, message: 'No automation paths configured' };
      }

      const paths = JSON.parse(pathsJson);
      const activePaths = paths.filter(p => p.enabled && p.status === 'Active');
      
      if (activePaths.length === 0) {
        console.log('📋 No active automation paths');
        return { success: true, message: 'No active automation paths' };
      }

      const results = [];
      const now = new Date();

      for (const path of activePaths) {
        // Check if this path should run based on schedule
        const shouldRun = this.shouldPathRun(path, now);
        
        if (shouldRun) {
          console.log(`🤖 Running automation path: ${path.name}`);
          
          // Trigger the main site's automation API
          try {
            const response = await fetch(`${env.MAIN_SITE_URL}/api/automation/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                pathId: path.id,
                category: path.category,
                subcategory: path.subcategory,
                triggeredBy: 'scheduler'
              })
            });
            
            const result = await response.json();
            results.push({ path: path.name, success: result.success, postId: result.postId });
          } catch (err) {
            console.error(`❌ Failed to run path ${path.name}:`, err.message);
            results.push({ path: path.name, success: false, error: err.message });
          }
        }
      }

      await this.logActivity(env, 'automation_run', { 
        pathsChecked: activePaths.length,
        results 
      });

      return { success: true, results };
    } catch (error) {
      console.error('❌ Error running automation paths:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Check if an automation path should run based on its schedule
   */
  shouldPathRun(path, now) {
    if (!path.schedule) return false;
    
    const { frequency, time, dayOfWeek, dayOfMonth } = path.schedule;
    const currentHour = now.getUTCHours();
    const currentDay = now.getUTCDay();
    const currentDate = now.getUTCDate();
    
    // Parse schedule time (default to 9 AM)
    const scheduledHour = time ? parseInt(time.split(':')[0]) : 9;
    
    // Check if current hour matches
    if (currentHour !== scheduledHour) return false;
    
    switch (frequency) {
      case 'hourly':
        return true;
      case 'daily':
        return true;
      case 'weekly':
        return dayOfWeek === undefined || currentDay === dayOfWeek;
      case 'monthly':
        return dayOfMonth === undefined || currentDate === dayOfMonth;
      default:
        return false;
    }
  },

  /**
   * Clean up expired data (rate limits, old sessions, etc.)
   */
  async cleanupExpiredData(env) {
    // KV items auto-expire, so minimal cleanup needed
    // This is a placeholder for future cleanup tasks
    console.log('🧹 Cleanup task completed');
    return { success: true };
  },

  /**
   * Log automation activity
   */
  async logActivity(env, action, details) {
    if (!env.DB) return;
    
    try {
      await env.DB.prepare(`
        INSERT INTO activity_log (id, user_id, action, details, created_at)
        VALUES (?, 'automation-scheduler', ?, ?, ?)
      `).bind(
        `act_${crypto.randomUUID().split('-')[0]}`,
        action,
        JSON.stringify(details),
        Date.now()
      ).run();
    } catch (err) {
      console.error('Failed to log activity:', err);
    }
  }
};
