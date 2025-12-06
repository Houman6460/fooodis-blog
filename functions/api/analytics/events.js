/**
 * Analytics Events API
 * POST /api/analytics/events - Track user events
 * GET /api/analytics/events - Get event statistics
 * 
 * Integrates with Cloudflare Analytics Engine for high-performance event tracking
 * Falls back to D1 storage if Analytics Engine is not configured
 */

/**
 * POST /api/analytics/events - Track an event
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const data = await request.json();
    const { 
      event,           // Event name (e.g., 'page_view', 'chatbot_open', 'ticket_created')
      category,        // Event category (e.g., 'engagement', 'conversion', 'support')
      properties,      // Additional event properties
      sessionId,       // Session identifier
      userId           // Optional user ID
    } = data;

    if (!event) {
      return new Response(JSON.stringify({ success: false, error: 'Event name required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const now = Date.now();
    const eventId = `evt_${crypto.randomUUID().split('-')[0]}`;
    
    // Get client info
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    const userAgent = request.headers.get('User-Agent') || '';
    const country = request.headers.get('CF-IPCountry') || 'unknown';
    const referer = request.headers.get('Referer') || '';

    // Try Analytics Engine first (if configured)
    if (env.ANALYTICS) {
      try {
        env.ANALYTICS.writeDataPoint({
          blobs: [
            event,                              // index 0: event name
            category || 'general',              // index 1: category
            country,                            // index 2: country
            userAgent.substring(0, 100),        // index 3: user agent (truncated)
            referer.substring(0, 200),          // index 4: referer (truncated)
            sessionId || '',                    // index 5: session ID
            userId || ''                        // index 6: user ID
          ],
          doubles: [
            now,                                // index 0: timestamp
            1                                   // index 1: count (for aggregation)
          ],
          indexes: [event]                      // Primary index for querying
        });
        
        console.log(`📊 Analytics Engine: Tracked ${event}`);
        
        return new Response(JSON.stringify({ 
          success: true, 
          eventId,
          tracked: 'analytics_engine'
        }), {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (aeError) {
        console.error('Analytics Engine error, falling back to D1:', aeError);
      }
    }

    // Fallback to D1 storage
    if (env.DB) {
      // Ensure analytics_events table exists
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS analytics_events (
            id TEXT PRIMARY KEY,
            event TEXT NOT NULL,
            category TEXT DEFAULT 'general',
            properties TEXT,
            session_id TEXT,
            user_id TEXT,
            ip_address TEXT,
            country TEXT,
            user_agent TEXT,
            referer TEXT,
            created_at INTEGER
          )
        `).run();
        
        await env.DB.prepare(`
          CREATE INDEX IF NOT EXISTS idx_events_event ON analytics_events(event)
        `).run();
        
        await env.DB.prepare(`
          CREATE INDEX IF NOT EXISTS idx_events_date ON analytics_events(created_at)
        `).run();
      } catch (e) {
        // Table may already exist
      }

      await env.DB.prepare(`
        INSERT INTO analytics_events (
          id, event, category, properties, session_id, user_id,
          ip_address, country, user_agent, referer, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        eventId,
        event,
        category || 'general',
        properties ? JSON.stringify(properties) : null,
        sessionId || null,
        userId || null,
        clientIP,
        country,
        userAgent.substring(0, 500),
        referer.substring(0, 500),
        now
      ).run();

      console.log(`📊 D1: Tracked ${event}`);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      eventId,
      tracked: 'd1'
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * GET /api/analytics/events - Get event statistics
 */
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const event = url.searchParams.get('event');
  const category = url.searchParams.get('category');
  const days = parseInt(url.searchParams.get('days')) || 7;
  const limit = parseInt(url.searchParams.get('limit')) || 100;

  if (!env.DB) {
    return new Response(JSON.stringify({ error: 'Database not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const since = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    // Build query
    let query = `
      SELECT event, category, COUNT(*) as count, 
             MIN(created_at) as first_seen,
             MAX(created_at) as last_seen
      FROM analytics_events 
      WHERE created_at >= ?
    `;
    const params = [since];

    if (event) {
      query += ' AND event = ?';
      params.push(event);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' GROUP BY event, category ORDER BY count DESC LIMIT ?';
    params.push(limit);

    const { results } = await env.DB.prepare(query).bind(...params).all();

    // Get daily breakdown for the top events
    const dailyQuery = `
      SELECT 
        event,
        DATE(created_at / 1000, 'unixepoch') as date,
        COUNT(*) as count
      FROM analytics_events
      WHERE created_at >= ?
      GROUP BY event, date
      ORDER BY date DESC
      LIMIT 200
    `;
    
    const { results: dailyResults } = await env.DB.prepare(dailyQuery).bind(since).all();

    // Get unique visitors (by session)
    const visitorsQuery = `
      SELECT COUNT(DISTINCT session_id) as unique_sessions,
             COUNT(DISTINCT user_id) as unique_users,
             COUNT(DISTINCT country) as countries
      FROM analytics_events
      WHERE created_at >= ?
    `;
    
    const visitors = await env.DB.prepare(visitorsQuery).bind(since).first();

    return new Response(JSON.stringify({
      success: true,
      period: { days, since: new Date(since).toISOString() },
      summary: {
        totalEvents: results.reduce((sum, r) => sum + r.count, 0),
        uniqueSessions: visitors?.unique_sessions || 0,
        uniqueUsers: visitors?.unique_users || 0,
        countries: visitors?.countries || 0
      },
      events: results,
      daily: dailyResults
    }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Analytics query error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
