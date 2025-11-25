-- Migration number: 0002 	 2024-05-25
-- Create blog_posts table

CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author TEXT,
    category TEXT,
    tags TEXT, -- JSON string
    published_date TEXT,
    status TEXT DEFAULT 'draft', -- 'published', 'draft', 'scheduled'
    likes INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    slug TEXT
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_date ON blog_posts(published_date);
