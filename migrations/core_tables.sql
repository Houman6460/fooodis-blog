-- Core tables for the blog system

-- Categories
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

-- Subcategories
CREATE TABLE IF NOT EXISTS subcategories (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    post_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tags
CREATE TABLE IF NOT EXISTS tags (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#6c757d',
    post_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- Media Library
CREATE TABLE IF NOT EXISTS media_library (
    id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    original_filename TEXT,
    mime_type TEXT,
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    r2_key TEXT NOT NULL,
    r2_url TEXT,
    url TEXT,
    thumbnail_url TEXT,
    folder TEXT DEFAULT 'uploads',
    alt_text TEXT,
    caption TEXT,
    title TEXT,
    tags TEXT,
    metadata TEXT,
    uploaded_by TEXT DEFAULT 'admin',
    usage_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- Media Folders
CREATE TABLE IF NOT EXISTS media_folders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT,
    description TEXT,
    parent_folder TEXT,
    color TEXT DEFAULT '#478ac9',
    icon TEXT DEFAULT 'folder',
    is_system INTEGER DEFAULT 0,
    item_count INTEGER DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- Default folders
INSERT OR IGNORE INTO media_folders (id, name, display_name, description, is_system, created_at, updated_at)
VALUES 
    ('folder_uploads', 'uploads', 'Uploads', 'Default upload folder', 1, 0, 0),
    ('folder_blog', 'blog-images', 'Blog Images', 'Images for blog posts', 1, 0, 0),
    ('folder_ai', 'ai-generated', 'AI Generated', 'AI-generated media', 1, 0, 0),
    ('folder_featured', 'featured', 'Featured', 'Featured images', 1, 0, 0);

-- Scheduled Posts
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
    updated_at INTEGER
);

-- Post Stats
CREATE TABLE IF NOT EXISTS post_stats (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares_total INTEGER DEFAULT 0,
    comments INTEGER DEFAULT 0,
    avg_read_time INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0,
    scroll_depth REAL DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    post_id TEXT NOT NULL,
    parent_id TEXT,
    author_name TEXT,
    author_email TEXT,
    author_url TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    is_approved INTEGER DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

-- Daily Stats
CREATE TABLE IF NOT EXISTS daily_stats (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    total_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    new_posts INTEGER DEFAULT 0,
    new_comments INTEGER DEFAULT 0,
    new_subscribers INTEGER DEFAULT 0,
    top_posts TEXT,
    traffic_sources TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- Default categories
INSERT OR IGNORE INTO categories (id, name, slug, description, color, sort_order, is_active, created_at, updated_at)
VALUES 
    ('cat_recipes', 'Recipes', 'recipes', 'Delicious recipes from around the world', '#e74c3c', 1, 1, 0, 0),
    ('cat_tips', 'Cooking Tips', 'cooking-tips', 'Professional cooking tips and tricks', '#3498db', 2, 1, 0, 0),
    ('cat_restaurants', 'Restaurants', 'restaurants', 'Restaurant reviews and recommendations', '#9b59b6', 3, 1, 0, 0),
    ('cat_news', 'Food News', 'food-news', 'Latest news from the food industry', '#27ae60', 4, 1, 0, 0);

-- Default tags
INSERT OR IGNORE INTO tags (id, name, slug, color, created_at, updated_at)
VALUES 
    ('tag_healthy', 'Healthy', 'healthy', '#27ae60', 0, 0),
    ('tag_quick', 'Quick & Easy', 'quick-easy', '#f39c12', 0, 0),
    ('tag_vegetarian', 'Vegetarian', 'vegetarian', '#2ecc71', 0, 0),
    ('tag_dessert', 'Dessert', 'dessert', '#e91e63', 0, 0),
    ('tag_breakfast', 'Breakfast', 'breakfast', '#ff9800', 0, 0);
