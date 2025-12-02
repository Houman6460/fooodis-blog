-- Migration number: 0007   2024-12-02
-- Schema synchronization - ensure all tables have required columns

-- ============================================
-- BLOG_POSTS TABLE - Add missing columns
-- ============================================
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so these will fail silently if columns exist

-- Check if columns exist before adding (run these one by one)
-- ALTER TABLE blog_posts ADD COLUMN subcategory TEXT;
-- ALTER TABLE blog_posts ADD COLUMN scheduled_date TEXT;
-- ALTER TABLE blog_posts ADD COLUMN featured INTEGER DEFAULT 0;
-- ALTER TABLE blog_posts ADD COLUMN views INTEGER DEFAULT 0;

-- ============================================
-- AI_ASSISTANTS TABLE - Add missing columns
-- ============================================
-- ALTER TABLE ai_assistants ADD COLUMN top_p REAL DEFAULT 1.0;
-- ALTER TABLE ai_assistants ADD COLUMN usage_count INTEGER DEFAULT 0;
-- ALTER TABLE ai_assistants ADD COLUMN last_used INTEGER;

-- ============================================
-- POST_TAGS TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER,
    PRIMARY KEY (post_id, tag_id)
);

-- ============================================
-- MEDIA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT,
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    r2_key TEXT NOT NULL,
    r2_url TEXT,
    thumbnail_key TEXT,
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    folder TEXT DEFAULT 'uploads',
    uploaded_by TEXT DEFAULT 'Admin',
    is_featured INTEGER DEFAULT 0,
    post_id TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'website',
    subscribed_at INTEGER,
    unsubscribed_at INTEGER,
    preferences TEXT,
    ip_address TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- ============================================
-- TICKET_MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,
    sender_id TEXT,
    sender_name TEXT,
    message TEXT NOT NULL,
    attachments TEXT,
    is_internal INTEGER DEFAULT 0,
    read_at INTEGER,
    created_at INTEGER
);

-- ============================================
-- TICKET_ATTACHMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_attachments (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    message_id TEXT,
    filename TEXT NOT NULL,
    original_filename TEXT,
    mime_type TEXT,
    file_size INTEGER,
    r2_key TEXT NOT NULL,
    r2_url TEXT,
    uploaded_by TEXT,
    created_at INTEGER
);

-- ============================================
-- USER_PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    preferences TEXT,
    last_login INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

-- ============================================
-- BLOG_SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    updated_at INTEGER
);

-- ============================================
-- Create indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media(r2_key);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
