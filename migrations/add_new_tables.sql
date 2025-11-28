-- Add new tables for Support Tickets, Chatbot, and Email Subscribers
-- This migration adds tables that may not exist

-- Support Customers
CREATE TABLE IF NOT EXISTS support_customers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    phone TEXT,
    company TEXT,
    password_hash TEXT,
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

-- Support Tickets
CREATE TABLE IF NOT EXISTS support_tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT UNIQUE NOT NULL,
    customer_id TEXT,
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    subject TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'open',
    source TEXT DEFAULT 'web',
    assignee_id TEXT,
    assignee_name TEXT,
    tags TEXT,
    internal_notes TEXT,
    resolution TEXT,
    first_response_at INTEGER,
    resolved_at INTEGER,
    closed_at INTEGER,
    reopened_count INTEGER DEFAULT 0,
    message_count INTEGER DEFAULT 0,
    satisfaction_rating INTEGER,
    satisfaction_feedback TEXT,
    metadata TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- Support Messages
CREATE TABLE IF NOT EXISTS support_messages (
    id TEXT PRIMARY KEY,
    ticket_id TEXT NOT NULL,
    author_type TEXT NOT NULL,
    author_id TEXT,
    author_name TEXT,
    author_email TEXT,
    content TEXT NOT NULL,
    attachments TEXT,
    is_internal INTEGER DEFAULT 0,
    created_at INTEGER
);

-- Ticket Attachments
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
    uploaded_by_type TEXT DEFAULT 'customer',
    created_at INTEGER
);

-- Ticket Categories
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

-- Canned Responses
CREATE TABLE IF NOT EXISTS canned_responses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    language TEXT DEFAULT 'en',
    shortcut TEXT,
    tags TEXT,
    usage_count INTEGER DEFAULT 0,
    created_by TEXT,
    is_public INTEGER DEFAULT 1,
    created_at INTEGER,
    updated_at INTEGER
);

-- Chatbot Conversations
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
    updated_at INTEGER
);

-- Chatbot Messages
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
    created_at INTEGER
);

-- Chatbot Users (Leads)
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

-- Chatbot Scenarios
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

-- Chatbot Settings
CREATE TABLE IF NOT EXISTS chatbot_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',
    category TEXT DEFAULT 'general',
    description TEXT,
    updated_at INTEGER
);

-- Chatbot Analytics
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

-- Chatbot Deployments
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

-- Email Subscribers
CREATE TABLE IF NOT EXISTS email_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active',
    source TEXT DEFAULT 'popup',
    tags TEXT,
    preferences TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    subscribed_at INTEGER,
    confirmed_at INTEGER,
    unsubscribed_at INTEGER,
    bounce_count INTEGER DEFAULT 0,
    last_email_sent INTEGER,
    last_email_opened INTEGER,
    last_email_clicked INTEGER,
    total_emails_sent INTEGER DEFAULT 0,
    total_emails_opened INTEGER DEFAULT 0,
    total_emails_clicked INTEGER DEFAULT 0,
    custom_fields TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- Email Popup Config
CREATE TABLE IF NOT EXISTS email_popup_config (
    id TEXT PRIMARY KEY DEFAULT 'default',
    enabled INTEGER DEFAULT 1,
    title TEXT DEFAULT 'Subscribe to Our Newsletter',
    description TEXT,
    button_text TEXT DEFAULT 'Subscribe',
    success_message TEXT DEFAULT 'Thank you for subscribing!',
    display_delay INTEGER DEFAULT 5000,
    display_frequency TEXT DEFAULT 'once_per_session',
    show_on_exit_intent INTEGER DEFAULT 1,
    background_color TEXT DEFAULT '#ffffff',
    text_color TEXT DEFAULT '#333333',
    button_color TEXT DEFAULT '#478ac9',
    custom_css TEXT,
    created_at INTEGER,
    updated_at INTEGER
);

-- AI Assistants (if not exists)
CREATE TABLE IF NOT EXISTS ai_assistants (
    id TEXT PRIMARY KEY,
    openai_assistant_id TEXT,
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'custom',
    model TEXT DEFAULT 'gpt-4',
    instructions TEXT,
    tools TEXT,
    file_ids TEXT,
    metadata TEXT,
    is_active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    code_interpreter INTEGER DEFAULT 0,
    retrieval INTEGER DEFAULT 0,
    function_calling INTEGER DEFAULT 0,
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 1000,
    created_at INTEGER,
    updated_at INTEGER
);

-- User Profiles
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

-- Insert default chatbot settings
INSERT OR IGNORE INTO chatbot_settings (key, value, type, category, updated_at) VALUES
    ('enabled', 'true', 'boolean', 'general', 0),
    ('chatbot_name', 'Fooodis Assistant', 'string', 'general', 0),
    ('welcome_message', 'Hello! How can I help you today?', 'string', 'general', 0),
    ('widget_position', 'bottom-right', 'string', 'widget', 0),
    ('widget_color', '#e8f24c', 'string', 'widget', 0),
    ('default_language', 'en', 'string', 'general', 0),
    ('supported_languages', '["en","sv"]', 'json', 'general', 0),
    ('default_model', 'gpt-4', 'string', 'ai', 0);

-- Insert default email popup config
INSERT OR IGNORE INTO email_popup_config (id, enabled, title, created_at, updated_at) 
VALUES ('default', 1, 'Subscribe to Our Newsletter', 0, 0);

-- Insert default admin profile
INSERT OR IGNORE INTO user_profiles (user_id, display_name, email, role, created_at, updated_at)
VALUES ('admin', 'Admin User', 'admin@fooodis.com', 'Administrator', 0, 0);
