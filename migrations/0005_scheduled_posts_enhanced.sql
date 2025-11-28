-- Migration number: 0005   2024-05-28
-- Enhanced Scheduled Posts for integration with all sections
-- Supports: Manual scheduling, AI Automation, Create New Post, Manage Posts

-- ============================================
-- DROP AND RECREATE SCHEDULED_POSTS TABLE
-- Enhanced version with full post data and source tracking
-- ============================================
DROP TABLE IF EXISTS scheduled_posts;

CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY,
    
    -- Post content (stored here until published)
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT,                           -- JSON array
    author TEXT DEFAULT 'Admin',
    slug TEXT,
    
    -- Scheduling info
    scheduled_datetime INTEGER NOT NULL, -- Unix timestamp for exact scheduling
    timezone TEXT DEFAULT 'UTC',
    
    -- Source tracking (integration with other sections)
    source TEXT DEFAULT 'manual',        -- 'manual', 'ai_automation', 'api', 'import'
    automation_path_id TEXT,             -- Links to automation_paths if AI generated
    automation_path_name TEXT,           -- Name for display
    generation_log_id TEXT,              -- Links to ai_generation_logs
    
    -- Status tracking
    status TEXT DEFAULT 'pending',       -- 'pending', 'publishing', 'published', 'failed', 'cancelled'
    published_post_id TEXT,              -- ID of blog_post after publishing
    
    -- Error handling
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_attempt INTEGER,
    error_message TEXT,
    
    -- Metadata
    is_featured INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,          -- Higher priority publishes first if same time
    notify_on_publish INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at INTEGER,
    updated_at INTEGER,
    
    FOREIGN KEY (automation_path_id) REFERENCES automation_paths(id) ON DELETE SET NULL,
    FOREIGN KEY (generation_log_id) REFERENCES ai_generation_logs(id) ON DELETE SET NULL,
    FOREIGN KEY (published_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_datetime ON scheduled_posts(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_scheduled_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_source ON scheduled_posts(source);
CREATE INDEX IF NOT EXISTS idx_scheduled_automation ON scheduled_posts(automation_path_id);

-- ============================================
-- Add scheduled_date to blog_posts if not exists
-- For posts created directly with schedule
-- ============================================
-- ALTER TABLE blog_posts ADD COLUMN scheduled_date INTEGER;
-- ALTER TABLE blog_posts ADD COLUMN scheduled_status TEXT;

-- ============================================
-- SCHEDULED_POST_HISTORY TABLE
-- Track all scheduling events
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_post_history (
    id TEXT PRIMARY KEY,
    scheduled_post_id TEXT NOT NULL,
    event_type TEXT NOT NULL,            -- 'created', 'updated', 'published', 'failed', 'cancelled', 'rescheduled'
    event_data TEXT,                     -- JSON with event details
    created_at INTEGER,
    FOREIGN KEY (scheduled_post_id) REFERENCES scheduled_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_post ON scheduled_post_history(scheduled_post_id);
CREATE INDEX IF NOT EXISTS idx_history_type ON scheduled_post_history(event_type);
