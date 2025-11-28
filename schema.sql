-- ============================================
-- FOOODIS BLOG COMPLETE DATABASE SCHEMA
-- ============================================
-- This schema defines all tables for the blog system
-- Run migrations in order: 0001, 0002, 0003 for incremental updates
-- Or use this file for a fresh database setup

-- ============================================
-- BLOG POSTS TABLE (Core)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author TEXT DEFAULT 'Admin',
    category TEXT DEFAULT 'Uncategorized',
    subcategory TEXT,
    tags TEXT,                          -- JSON array of tag names
    published_date TEXT,
    scheduled_date TEXT,                -- For scheduled posts
    status TEXT DEFAULT 'draft',        -- 'published', 'draft', 'scheduled', 'archived'
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    featured INTEGER DEFAULT 0,         -- Boolean: 1 = featured
    featured_image_id TEXT,             -- Reference to media_library
    created_at INTEGER,
    updated_at INTEGER,
    slug TEXT UNIQUE
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(published_date);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#478ac9',
    icon TEXT,
    post_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

-- ============================================
-- SUBCATEGORIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    parent_category_id TEXT NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (parent_category_id) REFERENCES categories(id) ON DELETE CASCADE,
    UNIQUE(slug, parent_category_id)
);

CREATE INDEX IF NOT EXISTS idx_subcategories_parent ON subcategories(parent_category_id);

-- ============================================
-- TAGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#e8f24c',
    post_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- ============================================
-- POST_TAGS JUNCTION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

-- ============================================
-- MEDIA LIBRARY TABLE (R2 metadata)
-- ============================================
CREATE TABLE IF NOT EXISTS media_library (
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
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media_library(r2_key);

-- ============================================
-- SCHEDULED POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,
    scheduled_time TEXT,
    timezone TEXT DEFAULT 'UTC',
    status TEXT DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_attempt INTEGER,
    error_message TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_scheduled_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_date ON scheduled_posts(scheduled_date);

-- ============================================
-- FEATURED POSTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS featured_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    start_date TEXT,
    end_date TEXT,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_featured_active ON featured_posts(is_active);

-- ============================================
-- BLOG SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    updated_at INTEGER
);

-- ============================================
-- POST STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS post_stats (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL UNIQUE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    shares_facebook INTEGER DEFAULT 0,
    shares_twitter INTEGER DEFAULT 0,
    shares_linkedin INTEGER DEFAULT 0,
    shares_email INTEGER DEFAULT 0,
    shares_total INTEGER DEFAULT 0,
    avg_read_time INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- ============================================
-- COMMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    parent_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    likes INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);

-- ============================================
-- AUTOMATION PATHS TABLE (AI Content)
-- ============================================
CREATE TABLE IF NOT EXISTS automation_paths (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content_type TEXT,
    assistant_id TEXT,
    category TEXT,
    subcategory TEXT,
    topics TEXT,
    mode TEXT,
    schedule_type TEXT,
    schedule_time TEXT,
    prompt_template TEXT,
    include_images INTEGER DEFAULT 0,
    media_folder TEXT,
    languages TEXT,
    created_at INTEGER,
    last_run INTEGER,
    status TEXT DEFAULT 'active'
);

CREATE INDEX IF NOT EXISTS idx_automation_paths_status ON automation_paths(status);

-- ============================================
-- CONVERSATIONS TABLE (Chatbot)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    messages TEXT,
    thread_id TEXT,
    language TEXT DEFAULT 'en',
    created_at INTEGER,
    updated_at TEXT
);
