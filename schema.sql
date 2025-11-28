-- ============================================
-- FOOODIS BLOG COMPLETE DATABASE SCHEMA
-- ============================================
-- This schema defines all tables for the blog system
-- Run migrations in order: 0001, 0002, 0003 for incremental updates
-- Or use this file for a fresh database setup

-- ============================================
-- USER PROFILES TABLE
-- Single admin profile for blog management
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'Administrator',
    bio TEXT,
    avatar_url TEXT,
    password_hash TEXT,
    password_changed_at INTEGER,
    social_links TEXT,
    preferences TEXT,
    last_login INTEGER,
    login_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- Default admin profile
INSERT OR IGNORE INTO user_profiles (user_id, display_name, email, role, preferences, created_at, updated_at)
VALUES ('admin', 'Admin User', 'admin@fooodis.com', 'Administrator', '{"theme":"dark","notifications":true}', 0, 0);

-- ============================================
-- ACTIVITY LOG TABLE
-- Track user actions
-- ============================================
CREATE TABLE IF NOT EXISTS activity_log (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_action ON activity_log(action);
CREATE INDEX IF NOT EXISTS idx_activity_date ON activity_log(created_at);

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
-- MEDIA FOLDERS TABLE
-- Organize media into logical folders
-- ============================================
CREATE TABLE IF NOT EXISTS media_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    display_name TEXT,
    description TEXT,
    parent_folder TEXT,
    file_count INTEGER DEFAULT 0,
    total_size INTEGER DEFAULT 0,
    color TEXT DEFAULT '#478ac9',
    icon TEXT DEFAULT 'folder',
    is_system INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (parent_folder) REFERENCES media_folders(name) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_media_folders_parent ON media_folders(parent_folder);

-- Default folders
INSERT OR IGNORE INTO media_folders (id, name, display_name, description, is_system, created_at, updated_at)
VALUES 
    ('folder_uploads', 'uploads', 'Uploads', 'Default upload folder', 1, 0, 0),
    ('folder_blog', 'blog-images', 'Blog Images', 'Images for blog posts', 1, 0, 0),
    ('folder_ai', 'ai-generated', 'AI Generated', 'AI-generated media', 1, 0, 0),
    ('folder_featured', 'featured', 'Featured', 'Featured images', 1, 0, 0);

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

CREATE INDEX IF NOT EXISTS idx_post_stats_post ON post_stats(post_id);

-- ============================================
-- PAGE VIEWS TABLE (Detailed tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS page_views (
    id TEXT PRIMARY KEY,
    post_id TEXT,
    visitor_id TEXT,
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    country TEXT,
    city TEXT,
    device_type TEXT,
    browser TEXT,
    session_id TEXT,
    created_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_page_views_post ON page_views(post_id);
CREATE INDEX IF NOT EXISTS idx_page_views_visitor ON page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at);

-- ============================================
-- ANALYTICS EVENTS TABLE (Custom events)
-- ============================================
CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    event_data TEXT,
    visitor_id TEXT,
    post_id TEXT,
    page_url TEXT,
    created_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_analytics_type ON analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON analytics_events(created_at);

-- ============================================
-- DAILY STATS AGGREGATE TABLE (for fast queries)
-- ============================================
CREATE TABLE IF NOT EXISTS daily_stats (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_shares INTEGER DEFAULT 0,
    total_comments INTEGER DEFAULT 0,
    posts_published INTEGER DEFAULT 0,
    top_post_id TEXT,
    top_category TEXT,
    created_at INTEGER,
    UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date);

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
-- AI GENERATION LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id TEXT PRIMARY KEY,
    automation_path_id TEXT,
    path_name TEXT,
    status TEXT DEFAULT 'pending',
    prompt_used TEXT,
    model_used TEXT,
    assistant_id TEXT,
    content_type TEXT,
    category TEXT,
    topic TEXT,
    language TEXT DEFAULT 'en',
    generated_title TEXT,
    generated_content TEXT,
    generated_excerpt TEXT,
    tokens_used INTEGER DEFAULT 0,
    generation_time_ms INTEGER,
    published_post_id TEXT,
    published_at INTEGER,
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    started_at INTEGER,
    completed_at INTEGER,
    created_at INTEGER,
    FOREIGN KEY (automation_path_id) REFERENCES automation_paths(id) ON DELETE SET NULL,
    FOREIGN KEY (published_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_path ON ai_generation_logs(automation_path_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON ai_generation_logs(status);

-- ============================================
-- AI ASSISTANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_assistants (
    id TEXT PRIMARY KEY,
    openai_assistant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'custom',
    model TEXT DEFAULT 'gpt-4',
    instructions TEXT,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    top_p REAL DEFAULT 1.0,
    code_interpreter INTEGER DEFAULT 0,
    retrieval INTEGER DEFAULT 0,
    function_calling INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_used INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_assistants_type ON ai_assistants(type);

-- ============================================
-- PROMPTS LIBRARY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS prompts_library (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    prompt_template TEXT NOT NULL,
    system_message TEXT,
    variables TEXT,
    example_output TEXT,
    is_default INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    created_by TEXT DEFAULT 'Admin',
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts_library(category);

-- ============================================
-- AI API USAGE TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_api_usage (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    requests_count INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    estimated_cost_cents INTEGER DEFAULT 0,
    model_usage TEXT,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_api_usage_date ON ai_api_usage(date);

-- ============================================
-- AI CONFIGURATION TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS ai_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    description TEXT,
    is_secret INTEGER DEFAULT 0,
    updated_at INTEGER
);

-- ============================================
-- SCHEDULED RUNS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_runs (
    id TEXT PRIMARY KEY,
    automation_path_id TEXT NOT NULL,
    scheduled_time INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    started_at INTEGER,
    completed_at INTEGER,
    generation_log_id TEXT,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (automation_path_id) REFERENCES automation_paths(id) ON DELETE CASCADE,
    FOREIGN KEY (generation_log_id) REFERENCES ai_generation_logs(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_runs_time ON scheduled_runs(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_scheduled_runs_status ON scheduled_runs(status);

-- ============================================
-- SCHEDULED POSTS TABLE (Enhanced)
-- Full post data with source tracking for all sections
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    category TEXT,
    subcategory TEXT,
    tags TEXT,
    author TEXT DEFAULT 'Admin',
    slug TEXT,
    scheduled_datetime INTEGER NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    source TEXT DEFAULT 'manual',
    automation_path_id TEXT,
    automation_path_name TEXT,
    generation_log_id TEXT,
    status TEXT DEFAULT 'pending',
    published_post_id TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    last_attempt INTEGER,
    error_message TEXT,
    is_featured INTEGER DEFAULT 0,
    priority INTEGER DEFAULT 0,
    notify_on_publish INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (automation_path_id) REFERENCES automation_paths(id) ON DELETE SET NULL,
    FOREIGN KEY (generation_log_id) REFERENCES ai_generation_logs(id) ON DELETE SET NULL,
    FOREIGN KEY (published_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_scheduled_datetime ON scheduled_posts(scheduled_datetime);
CREATE INDEX IF NOT EXISTS idx_scheduled_status ON scheduled_posts(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_source ON scheduled_posts(source);

-- ============================================
-- SCHEDULED POST HISTORY TABLE
-- Track scheduling events
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_post_history (
    id TEXT PRIMARY KEY,
    scheduled_post_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    event_data TEXT,
    created_at INTEGER,
    FOREIGN KEY (scheduled_post_id) REFERENCES scheduled_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_history_post ON scheduled_post_history(scheduled_post_id);

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
