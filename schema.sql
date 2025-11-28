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
-- EMAIL SUBSCRIBERS TABLE
-- Store newsletter subscribers
-- ============================================
CREATE TABLE IF NOT EXISTS email_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'popup',
    ip_address TEXT,
    country TEXT,
    subscribed_at INTEGER,
    confirmed_at INTEGER,
    unsubscribed_at INTEGER,
    preferences TEXT,
    tags TEXT,
    custom_fields TEXT,
    bounce_count INTEGER DEFAULT 0,
    last_email_sent INTEGER,
    last_email_opened INTEGER,
    last_email_clicked INTEGER,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_emails_clicked INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_subscribers_email ON email_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON email_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_source ON email_subscribers(source);

-- ============================================
-- EMAIL CAMPAIGNS TABLE
-- Store email campaign data
-- ============================================
CREATE TABLE IF NOT EXISTS email_campaigns (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    preview_text TEXT,
    content TEXT,
    template_id TEXT,
    status TEXT DEFAULT 'draft',
    type TEXT DEFAULT 'newsletter',
    send_to TEXT DEFAULT 'all',
    segment_rules TEXT,
    scheduled_at INTEGER,
    sent_at INTEGER,
    total_recipients INTEGER DEFAULT 0,
    total_sent INTEGER DEFAULT 0,
    total_delivered INTEGER DEFAULT 0,
    total_opened INTEGER DEFAULT 0,
    total_clicked INTEGER DEFAULT 0,
    total_bounced INTEGER DEFAULT 0,
    total_unsubscribed INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (template_id) REFERENCES email_templates(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_campaigns_status ON email_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_scheduled ON email_campaigns(scheduled_at);

-- ============================================
-- EMAIL TEMPLATES TABLE
-- Store reusable email templates
-- ============================================
CREATE TABLE IF NOT EXISTS email_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    subject_template TEXT,
    content TEXT NOT NULL,
    preview_image TEXT,
    is_default INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_templates_category ON email_templates(category);

-- ============================================
-- EMAIL SENDS TABLE
-- Track individual email sends
-- ============================================
CREATE TABLE IF NOT EXISTS email_sends (
    id TEXT PRIMARY KEY,
    campaign_id TEXT NOT NULL,
    subscriber_id TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    sent_at INTEGER,
    delivered_at INTEGER,
    opened_at INTEGER,
    clicked_at INTEGER,
    bounced_at INTEGER,
    bounce_type TEXT,
    unsubscribed_at INTEGER,
    error_message TEXT,
    created_at INTEGER,
    FOREIGN KEY (campaign_id) REFERENCES email_campaigns(id) ON DELETE CASCADE,
    FOREIGN KEY (subscriber_id) REFERENCES email_subscribers(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sends_campaign ON email_sends(campaign_id);
CREATE INDEX IF NOT EXISTS idx_sends_subscriber ON email_sends(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_sends_status ON email_sends(status);

-- ============================================
-- EMAIL POPUP CONFIG TABLE
-- Store email popup configuration
-- ============================================
CREATE TABLE IF NOT EXISTS email_popup_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    enabled INTEGER DEFAULT 1,
    title TEXT DEFAULT 'Subscribe to Our Newsletter',
    description TEXT DEFAULT 'Get the latest food news and recipes delivered to your inbox!',
    button_text TEXT DEFAULT 'Subscribe',
    placeholder_text TEXT DEFAULT 'Enter your email address',
    success_message TEXT DEFAULT 'Thank you for subscribing!',
    trigger_type TEXT DEFAULT 'time',
    trigger_delay INTEGER DEFAULT 5,
    trigger_scroll_percent INTEGER DEFAULT 50,
    show_once INTEGER DEFAULT 1,
    show_every_days INTEGER DEFAULT 7,
    background_color TEXT DEFAULT '#1e1e24',
    text_color TEXT DEFAULT '#e0e0e0',
    button_color TEXT DEFAULT '#cce62a',
    popup_image TEXT,
    custom_css TEXT,
    updated_at INTEGER
);

-- Default popup config
INSERT OR IGNORE INTO email_popup_config (id, updated_at) VALUES ('default', 0);

-- ============================================
-- SUPPORT CUSTOMERS TABLE
-- Store customer/user profiles for support portal
-- ============================================
CREATE TABLE IF NOT EXISTS support_customers (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    phone TEXT,
    company TEXT,
    password_hash TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    email_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    reset_token TEXT,
    reset_token_expires INTEGER,
    last_login INTEGER,
    login_count INTEGER DEFAULT 0,
    total_tickets INTEGER DEFAULT 0,
    preferences TEXT,
    metadata TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_support_customers_email ON support_customers(email);
CREATE INDEX IF NOT EXISTS idx_support_customers_status ON support_customers(status);

-- ============================================
-- SUPPORT TICKETS TABLE
-- Main tickets table
-- ============================================
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    customer_id TEXT,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    assignee_id TEXT,
    assignee_name TEXT,
    tags TEXT,
    internal_notes TEXT,
    resolution TEXT,
    satisfaction_rating INTEGER,
    satisfaction_feedback TEXT,
    first_response_at INTEGER,
    resolved_at INTEGER,
    closed_at INTEGER,
    reopened_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    source TEXT DEFAULT 'web',
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (customer_id) REFERENCES support_customers(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_tickets_number ON support_tickets(ticket_number);
CREATE INDEX IF NOT EXISTS idx_tickets_customer ON support_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON support_tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON support_tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assignee ON support_tickets(assignee_id);

-- ============================================
-- SUPPORT MESSAGES TABLE
-- Ticket messages and replies
-- ============================================
CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    author_type TEXT NOT NULL,
    author_id TEXT,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    is_internal INTEGER DEFAULT 0,
    attachments TEXT,
    read_at INTEGER,
    created_at INTEGER,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_ticket ON support_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_messages_author ON support_messages(author_type, author_id);

-- ============================================
-- TICKET ATTACHMENTS TABLE
-- File attachments for tickets
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
    uploaded_by_type TEXT,
    created_at INTEGER,
    FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (message_id) REFERENCES support_messages(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_attachments_ticket ON ticket_attachments(ticket_id);

-- ============================================
-- TICKET CATEGORIES TABLE
-- Predefined ticket categories
-- ============================================
CREATE TABLE IF NOT EXISTS ticket_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT DEFAULT '#478ac9',
    icon TEXT DEFAULT 'tag',
    sort_order INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    auto_assign_to TEXT,
    sla_response_hours INTEGER DEFAULT 24,
    sla_resolution_hours INTEGER DEFAULT 72,
    created_at INTEGER,
    updated_at INTEGER
);

-- Default categories
INSERT OR IGNORE INTO ticket_categories (id, name, description, color, icon, sort_order, created_at, updated_at)
VALUES 
    ('cat_general', 'General', 'General inquiries', '#478ac9', 'question-circle', 1, 0, 0),
    ('cat_technical', 'Technical', 'Technical issues and bugs', '#e74c3c', 'bug', 2, 0, 0),
    ('cat_billing', 'Billing', 'Payment and billing questions', '#27ae60', 'credit-card', 3, 0, 0),
    ('cat_feature', 'Feature Request', 'New feature suggestions', '#9b59b6', 'lightbulb', 4, 0, 0),
    ('cat_feedback', 'Feedback', 'General feedback', '#f39c12', 'comment', 5, 0, 0);

-- ============================================
-- CANNED RESPONSES TABLE
-- Pre-written response templates
-- ============================================
CREATE TABLE IF NOT EXISTS canned_responses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    shortcut TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    is_public INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_canned_category ON canned_responses(category);

-- ============================================
-- CHATBOT CONVERSATIONS TABLE
-- Store all chatbot conversations
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_conversations (
    id TEXT PRIMARY KEY,
    visitor_id TEXT,
    user_id TEXT,
    thread_id TEXT,
    assistant_id TEXT,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    restaurant_name TEXT,
    user_type TEXT,
    language TEXT DEFAULT 'en',
    language_flag TEXT DEFAULT '🇺🇸',
    status TEXT DEFAULT 'active',
    is_registered INTEGER DEFAULT 0,
    rating INTEGER,
    rating_feedback TEXT,
    message_count INTEGER DEFAULT 0,
    first_message_at INTEGER,
    last_message_at INTEGER,
    ended_at INTEGER,
    metadata TEXT,
    created_at INTEGER,
    updated_at INTEGER,
    FOREIGN KEY (user_id) REFERENCES chatbot_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_conv_visitor ON chatbot_conversations(visitor_id);
CREATE INDEX IF NOT EXISTS idx_conv_user ON chatbot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conv_status ON chatbot_conversations(status);
CREATE INDEX IF NOT EXISTS idx_conv_date ON chatbot_conversations(created_at);

-- ============================================
-- CHATBOT MESSAGES TABLE
-- Store individual messages in conversations
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id TEXT PRIMARY KEY,
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    assistant_id TEXT,
    assistant_name TEXT,
    tokens_used INTEGER DEFAULT 0,
    response_time_ms INTEGER,
    metadata TEXT,
    created_at INTEGER,
    FOREIGN KEY (conversation_id) REFERENCES chatbot_conversations(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_msg_conversation ON chatbot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_msg_role ON chatbot_messages(role);

-- ============================================
-- CHATBOT USERS (LEADS) TABLE
-- Store user/lead information from chatbot
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_users (
    id TEXT PRIMARY KEY,
    visitor_id TEXT,
    email TEXT UNIQUE,
    name TEXT,
    phone TEXT,
    company TEXT,
    restaurant_name TEXT,
    user_type TEXT,
    system_usage TEXT,
    language TEXT DEFAULT 'en',
    source TEXT DEFAULT 'chatbot',
    status TEXT DEFAULT 'lead',
    total_conversations INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    last_conversation_at INTEGER,
    custom_fields TEXT,
    tags TEXT,
    notes TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_chatbot_users_email ON chatbot_users(email);
CREATE INDEX IF NOT EXISTS idx_chatbot_users_status ON chatbot_users(status);

-- ============================================
-- CHATBOT SCENARIOS TABLE
-- Store conversation flow scenarios
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_scenarios (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    trigger_type TEXT DEFAULT 'keyword',
    trigger_value TEXT,
    language TEXT DEFAULT 'all',
    flow_data TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    priority INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_scenarios_active ON chatbot_scenarios(is_active);
CREATE INDEX IF NOT EXISTS idx_scenarios_trigger ON chatbot_scenarios(trigger_type);

-- ============================================
-- CHATBOT SETTINGS TABLE
-- Store chatbot configuration
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at INTEGER
);

-- Default chatbot settings
INSERT OR IGNORE INTO chatbot_settings (key, value, type, category, updated_at) VALUES
    ('enabled', 'true', 'boolean', 'general', 0),
    ('chatbot_name', 'Fooodis Assistant', 'string', 'general', 0),
    ('welcome_message', 'Hello! I''m your Fooodis assistant. How can I help you today?', 'string', 'general', 0),
    ('widget_position', 'bottom-right', 'string', 'widget', 0),
    ('widget_color', '#e8f24c', 'string', 'widget', 0),
    ('default_language', 'en', 'string', 'general', 0),
    ('supported_languages', '["en","sv"]', 'json', 'general', 0),
    ('default_model', 'gpt-4', 'string', 'ai', 0),
    ('enable_file_upload', 'true', 'boolean', 'features', 0),
    ('enable_typing_indicator', 'true', 'boolean', 'features', 0),
    ('enable_rating', 'true', 'boolean', 'features', 0),
    ('enable_lead_capture', 'true', 'boolean', 'features', 0),
    ('auto_greeting_delay', '3', 'number', 'behavior', 0);

-- ============================================
-- CHATBOT ANALYTICS TABLE
-- Store daily chatbot analytics
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_analytics (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL UNIQUE,
    total_conversations INTEGER DEFAULT 0,
    new_conversations INTEGER DEFAULT 0,
    returning_users INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    avg_messages_per_conversation REAL DEFAULT 0,
    total_tokens_used INTEGER DEFAULT 0,
    leads_captured INTEGER DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    ratings_sum INTEGER DEFAULT 0,
    avg_rating REAL DEFAULT 0,
    languages_used TEXT,
    top_topics TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_date ON chatbot_analytics(date);

-- ============================================
-- CHATBOT WIDGET DEPLOYMENTS TABLE
-- Track widget code deployments
-- ============================================
CREATE TABLE IF NOT EXISTS chatbot_deployments (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    domain TEXT,
    config TEXT,
    api_key TEXT,
    is_active INTEGER DEFAULT 1,
    last_ping INTEGER,
    total_loads INTEGER DEFAULT 0,
    created_at INTEGER,
    updated_at INTEGER
);

-- ============================================
-- LEGACY CONVERSATIONS TABLE (for migration)
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY,
    messages TEXT,
    thread_id TEXT,
    language TEXT DEFAULT 'en',
    created_at INTEGER,
    updated_at TEXT
);
