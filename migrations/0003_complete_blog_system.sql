-- Migration number: 0003   2024-05-28
-- Complete blog system tables for Create New Blog Post section
-- Includes: categories, subcategories, tags, media, scheduled_posts, featured_posts, settings

-- ============================================
-- CATEGORIES TABLE
-- Stores blog categories (shared with Manage Posts, AI Automation)
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
-- Stores subcategories with parent category relationship
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
CREATE INDEX IF NOT EXISTS idx_subcategories_slug ON subcategories(slug);

-- ============================================
-- TAGS TABLE
-- Stores blog tags (shared across all posts)
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
CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);

-- ============================================
-- POST_TAGS JUNCTION TABLE
-- Many-to-many relationship between posts and tags
-- ============================================
CREATE TABLE IF NOT EXISTS post_tags (
    post_id TEXT NOT NULL,
    tag_id TEXT NOT NULL,
    created_at INTEGER,
    PRIMARY KEY (post_id, tag_id),
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_tags_post ON post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_post_tags_tag ON post_tags(tag_id);

-- ============================================
-- MEDIA LIBRARY TABLE
-- Stores uploaded media files (references R2 bucket)
-- ============================================
CREATE TABLE IF NOT EXISTS media_library (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT,
    mime_type TEXT NOT NULL,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    r2_key TEXT NOT NULL,          -- R2 bucket object key
    r2_url TEXT,                   -- Public URL from R2
    thumbnail_key TEXT,            -- R2 key for thumbnail (images)
    thumbnail_url TEXT,
    alt_text TEXT,
    caption TEXT,
    folder TEXT DEFAULT 'uploads', -- Logical folder organization
    uploaded_by TEXT DEFAULT 'Admin',
    is_featured INTEGER DEFAULT 0,
    post_id TEXT,                  -- Optional: linked to a specific post
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_folder ON media_library(folder);
CREATE INDEX IF NOT EXISTS idx_media_mime ON media_library(mime_type);
CREATE INDEX IF NOT EXISTS idx_media_post ON media_library(post_id);
CREATE INDEX IF NOT EXISTS idx_media_r2_key ON media_library(r2_key);

-- ============================================
-- SCHEDULED POSTS TABLE
-- Stores scheduled post information
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    scheduled_date TEXT NOT NULL,   -- ISO date string
    scheduled_time TEXT,            -- Time portion
    timezone TEXT DEFAULT 'UTC',
    status TEXT DEFAULT 'pending',  -- 'pending', 'published', 'failed', 'cancelled'
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
-- Tracks featured posts for banner display
-- ============================================
CREATE TABLE IF NOT EXISTS featured_posts (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL UNIQUE,
    display_order INTEGER DEFAULT 0,
    start_date TEXT,                -- Optional: feature start date
    end_date TEXT,                  -- Optional: feature end date
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_featured_active ON featured_posts(is_active);
CREATE INDEX IF NOT EXISTS idx_featured_order ON featured_posts(display_order);

-- ============================================
-- BLOG SETTINGS TABLE
-- Stores blog configuration (backup to KV)
-- ============================================
CREATE TABLE IF NOT EXISTS blog_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',     -- 'string', 'number', 'boolean', 'json'
    description TEXT,
    updated_at INTEGER
);

-- ============================================
-- POST REVISIONS TABLE
-- Stores post edit history for version control
-- ============================================
CREATE TABLE IF NOT EXISTS post_revisions (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    title TEXT,
    content TEXT,
    excerpt TEXT,
    revision_number INTEGER,
    change_summary TEXT,
    created_by TEXT DEFAULT 'Admin',
    created_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_revisions_post ON post_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_revisions_number ON post_revisions(revision_number);

-- ============================================
-- COMMENTS TABLE (for future use)
-- Stores blog post comments
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    parent_id TEXT,                 -- For threaded comments
    author_name TEXT NOT NULL,
    author_email TEXT,
    author_url TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'spam', 'trash'
    ip_address TEXT,
    user_agent TEXT,
    likes INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_post ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_id);

-- ============================================
-- POST STATS TABLE
-- Stores post analytics (views, shares, etc.)
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
    avg_read_time INTEGER DEFAULT 0, -- in seconds
    bounce_rate REAL DEFAULT 0,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_post_stats_views ON post_stats(views);

-- ============================================
-- Insert default categories
-- ============================================
INSERT OR IGNORE INTO categories (id, name, slug, description, color, sort_order, is_active, created_at, updated_at)
VALUES 
    ('cat_technology', 'Technology', 'technology', 'Tech trends and innovations for restaurants', '#478ac9', 1, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_marketing', 'Marketing', 'marketing', 'Marketing strategies and tips', '#e8f24c', 2, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_operations', 'Operations', 'operations', 'Restaurant operations and management', '#28a745', 3, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_digital', 'Digital Solutions', 'digital-solutions', 'Digital tools and platforms', '#9b59b6', 4, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_customer', 'Customer Service', 'customer-service', 'Customer experience and service', '#e74c3c', 5, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('cat_growth', 'Business Growth', 'business-growth', 'Growth strategies and insights', '#f39c12', 6, 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- ============================================
-- Insert default blog settings
-- ============================================
INSERT OR IGNORE INTO blog_settings (key, value, type, description, updated_at)
VALUES 
    ('blog_title', 'Fooodis Blog', 'string', 'The main title of the blog', strftime('%s', 'now') * 1000),
    ('blog_description', 'Latest insights, tips, and updates for restaurant management', 'string', 'Blog meta description', strftime('%s', 'now') * 1000),
    ('posts_per_page', '6', 'number', 'Number of posts to display per page', strftime('%s', 'now') * 1000),
    ('show_featured_banner', 'true', 'boolean', 'Show featured posts banner on blog page', strftime('%s', 'now') * 1000),
    ('show_sidebar', 'true', 'boolean', 'Show sidebar with categories and tags', strftime('%s', 'now') * 1000),
    ('enable_comments', 'false', 'boolean', 'Enable comments on blog posts', strftime('%s', 'now') * 1000),
    ('moderate_comments', 'true', 'boolean', 'Require comment approval before display', strftime('%s', 'now') * 1000),
    ('default_author', 'Admin', 'string', 'Default author name for posts', strftime('%s', 'now') * 1000),
    ('excerpt_length', '150', 'number', 'Default excerpt length in characters', strftime('%s', 'now') * 1000),
    ('date_format', 'MMM DD, YYYY', 'string', 'Date display format', strftime('%s', 'now') * 1000);

-- ============================================
-- Add subcategory_id column to blog_posts if not exists
-- (Using a workaround since SQLite doesn't support ADD COLUMN IF NOT EXISTS)
-- ============================================
-- Note: Run this separately if needed:
-- ALTER TABLE blog_posts ADD COLUMN subcategory_id TEXT REFERENCES subcategories(id);
-- ALTER TABLE blog_posts ADD COLUMN featured_image_id TEXT REFERENCES media_library(id);
-- ALTER TABLE blog_posts ADD COLUMN scheduled_id TEXT REFERENCES scheduled_posts(id);
