-- Migration number: 0006   2024-12-02
-- Add missing tables for complete system functionality

-- ============================================
-- POST_TAGS JUNCTION TABLE (if not exists)
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER,
    PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- ============================================
-- MEDIA TABLE (alias for media_library)
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

CREATE INDEX IF NOT EXISTS idx_media_folder ON media(folder);
CREATE INDEX IF NOT EXISTS idx_media_mime ON media(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media(r2_key);

-- ============================================
-- SUBSCRIBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT DEFAULT 'active',  -- active, unsubscribed, bounced
    source TEXT DEFAULT 'website',
    subscribed_at INTEGER,
    unsubscribed_at INTEGER,
    preferences TEXT,  -- JSON for topic preferences
    ip_address TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);

-- ============================================
-- TICKET MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    sender_type TEXT NOT NULL,  -- 'customer' or 'agent'
    sender_id TEXT,
    sender_name TEXT,
    message TEXT NOT NULL,
    attachments TEXT,  -- JSON array of attachment URLs
    is_internal INTEGER DEFAULT 0,  -- Internal notes not visible to customer
    read_at INTEGER,
    created_at INTEGER,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_sender ON ticket_messages(sender_type);

-- ============================================
-- TICKET ATTACHMENTS TABLE
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
    created_at INTEGER,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES ticket_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================
-- USER PROFILES TABLE (for dashboard users)
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    display_name TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',  -- admin, editor, user
    preferences TEXT,  -- JSON for user preferences
    last_login INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);
