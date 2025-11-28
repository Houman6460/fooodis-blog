-- Migration number: 0004   2024-05-28
-- AI Configuration tables for AI Content Automation section
-- Includes: generation_logs, ai_assistants, prompts_library, api_usage

-- ============================================
-- AI GENERATION LOGS TABLE
-- Tracks all AI content generation attempts
-- ============================================
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id TEXT PRIMARY KEY,
    automation_path_id TEXT,
    path_name TEXT,
    status TEXT DEFAULT 'pending',          -- 'pending', 'generating', 'completed', 'failed'
    
    -- Request details
    prompt_used TEXT,
    model_used TEXT,
    assistant_id TEXT,
    content_type TEXT,
    category TEXT,
    topic TEXT,
    language TEXT DEFAULT 'en',
    
    -- Response details
    generated_title TEXT,
    generated_content TEXT,
    generated_excerpt TEXT,
    tokens_used INTEGER DEFAULT 0,
    generation_time_ms INTEGER,
    
    -- Post reference (if published)
    published_post_id TEXT,
    published_at INTEGER,
    
    -- Error tracking
    error_message TEXT,
    error_code TEXT,
    retry_count INTEGER DEFAULT 0,
    
    -- Timestamps
    started_at INTEGER,
    completed_at INTEGER,
    created_at INTEGER,
    
    FOREIGN KEY (automation_path_id) REFERENCES automation_paths(id) ON DELETE SET NULL,
    FOREIGN KEY (published_post_id) REFERENCES blog_posts(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_generation_logs_path ON ai_generation_logs(automation_path_id);
CREATE INDEX IF NOT EXISTS idx_generation_logs_status ON ai_generation_logs(status);
CREATE INDEX IF NOT EXISTS idx_generation_logs_date ON ai_generation_logs(created_at);

-- ============================================
-- AI ASSISTANTS TABLE
-- Stores custom OpenAI assistant configurations
-- ============================================
CREATE TABLE IF NOT EXISTS ai_assistants (
    id TEXT PRIMARY KEY,
    openai_assistant_id TEXT NOT NULL,      -- The actual OpenAI Assistant ID
    name TEXT NOT NULL,
    description TEXT,
    type TEXT DEFAULT 'custom',             -- 'default', 'recipe-creator', 'food-blogger', 'custom'
    model TEXT DEFAULT 'gpt-4',
    instructions TEXT,                      -- System instructions for the assistant
    
    -- Configuration
    temperature REAL DEFAULT 0.7,
    max_tokens INTEGER DEFAULT 2000,
    top_p REAL DEFAULT 1.0,
    
    -- Tools enabled
    code_interpreter INTEGER DEFAULT 0,
    retrieval INTEGER DEFAULT 0,
    function_calling INTEGER DEFAULT 0,
    
    -- Metadata
    is_active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    usage_count INTEGER DEFAULT 0,
    last_used INTEGER,
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_assistants_openai_id ON ai_assistants(openai_assistant_id);
CREATE INDEX IF NOT EXISTS idx_assistants_type ON ai_assistants(type);
CREATE INDEX IF NOT EXISTS idx_assistants_active ON ai_assistants(is_active);

-- ============================================
-- PROMPTS LIBRARY TABLE
-- Reusable prompt templates
-- ============================================
CREATE TABLE IF NOT EXISTS prompts_library (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',        -- 'general', 'recipe', 'review', 'seo', 'social'
    
    -- Prompt content
    prompt_template TEXT NOT NULL,
    system_message TEXT,
    
    -- Variables available in this prompt
    variables TEXT,                         -- JSON array of variable names
    
    -- Example output
    example_output TEXT,
    
    -- Metadata
    is_default INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 1,
    usage_count INTEGER DEFAULT 0,
    rating REAL DEFAULT 0,
    created_by TEXT DEFAULT 'Admin',
    created_at INTEGER,
    updated_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_prompts_category ON prompts_library(category);
CREATE INDEX IF NOT EXISTS idx_prompts_default ON prompts_library(is_default);

-- ============================================
-- AI API USAGE TABLE
-- Track API usage and costs
-- ============================================
CREATE TABLE IF NOT EXISTS ai_api_usage (
    id TEXT PRIMARY KEY,
    date TEXT NOT NULL,                     -- YYYY-MM-DD format for daily aggregation
    
    -- Token counts
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    
    -- Request counts
    requests_count INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    
    -- Cost tracking (in cents)
    estimated_cost_cents INTEGER DEFAULT 0,
    
    -- Model breakdown (JSON)
    model_usage TEXT,                       -- JSON: {"gpt-4": 1000, "gpt-3.5-turbo": 500}
    
    -- Metadata
    updated_at INTEGER,
    
    UNIQUE(date)
);

CREATE INDEX IF NOT EXISTS idx_api_usage_date ON ai_api_usage(date);

-- ============================================
-- AI CONFIGURATION SETTINGS TABLE
-- Stores AI-specific configuration
-- ============================================
CREATE TABLE IF NOT EXISTS ai_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    type TEXT DEFAULT 'string',             -- 'string', 'number', 'boolean', 'json', 'encrypted'
    description TEXT,
    is_secret INTEGER DEFAULT 0,            -- 1 for API keys and sensitive data
    updated_at INTEGER
);

-- ============================================
-- SCHEDULED RUNS TABLE
-- Queue for scheduled automation runs
-- ============================================
CREATE TABLE IF NOT EXISTS scheduled_runs (
    id TEXT PRIMARY KEY,
    automation_path_id TEXT NOT NULL,
    scheduled_time INTEGER NOT NULL,        -- Unix timestamp
    status TEXT DEFAULT 'pending',          -- 'pending', 'running', 'completed', 'failed', 'cancelled'
    
    -- Execution details
    started_at INTEGER,
    completed_at INTEGER,
    generation_log_id TEXT,
    
    -- Error tracking
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
CREATE INDEX IF NOT EXISTS idx_scheduled_runs_path ON scheduled_runs(automation_path_id);

-- ============================================
-- Insert default AI assistants
-- ============================================
INSERT OR IGNORE INTO ai_assistants (id, openai_assistant_id, name, description, type, model, instructions, is_default, created_at, updated_at)
VALUES 
    ('asst_default', '', 'Default Assistant', 'General-purpose content generation', 'default', 'gpt-4', 'You are a helpful content writer for a food and restaurant blog. Write engaging, SEO-friendly content.', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('asst_recipe', '', 'Recipe Creator', 'Specialized in creating detailed recipes', 'recipe-creator', 'gpt-4', 'You are an expert chef and recipe writer. Create detailed, easy-to-follow recipes with ingredient lists, step-by-step instructions, and helpful tips.', 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('asst_reviewer', '', 'Restaurant Reviewer', 'Specialized in restaurant reviews', 'restaurant-reviewer', 'gpt-4', 'You are a professional food critic. Write balanced, detailed restaurant reviews covering ambiance, service, food quality, and value.', 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('asst_blogger', '', 'Food Blogger', 'Casual, engaging food content', 'food-blogger', 'gpt-4', 'You are a passionate food blogger. Write engaging, personal stories about food experiences, trends, and discoveries.', 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    ('asst_nutrition', '', 'Nutrition Expert', 'Health and nutrition focused content', 'nutrition-expert', 'gpt-4', 'You are a certified nutritionist. Write informative, evidence-based content about healthy eating, nutrition facts, and dietary advice.', 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- ============================================
-- Insert default prompt templates
-- ============================================
INSERT OR IGNORE INTO prompts_library (id, name, description, category, prompt_template, variables, is_default, created_at, updated_at)
VALUES 
    ('prompt_blog_general', 'General Blog Post', 'Standard blog post template', 'general', 
     'Write a comprehensive blog post about {topic} for a food and restaurant audience. Include an engaging introduction, detailed body content with subheadings, and a compelling conclusion. The post should be SEO-friendly and approximately 800-1200 words.',
     '["topic", "category", "subcategory"]', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    
    ('prompt_recipe', 'Recipe Post', 'Detailed recipe template', 'recipe',
     'Create a detailed recipe for {topic}. Include: 1) An engaging introduction about the dish, 2) Complete ingredient list with measurements, 3) Step-by-step cooking instructions, 4) Preparation and cooking times, 5) Serving suggestions, 6) Pro tips and variations. Format with clear headings.',
     '["topic", "cuisine", "difficulty"]', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    
    ('prompt_review', 'Restaurant Review', 'Restaurant review template', 'review',
     'Write a professional restaurant review about {topic}. Cover: 1) First impressions and ambiance, 2) Service quality, 3) Food presentation and taste (mention specific dishes), 4) Value for money, 5) Overall rating and recommendation. Be balanced and fair in your assessment.',
     '["topic", "location", "cuisine_type"]', 1, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000),
    
    ('prompt_seo', 'SEO-Optimized Post', 'SEO-focused content template', 'seo',
     'Write an SEO-optimized blog post about {topic}. Include: 1) A compelling title with the main keyword, 2) Meta description (150-160 chars), 3) Introduction with the keyword in the first paragraph, 4) H2 and H3 subheadings with related keywords, 5) Internal linking suggestions, 6) Call-to-action conclusion. Target keyword: {keyword}',
     '["topic", "keyword", "secondary_keywords"]', 0, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000);

-- ============================================
-- Insert default AI configuration
-- ============================================
INSERT OR IGNORE INTO ai_config (key, value, type, description, is_secret, updated_at)
VALUES 
    ('openai_model', 'gpt-4', 'string', 'Default OpenAI model to use', 0, strftime('%s', 'now') * 1000),
    ('max_tokens', '2000', 'number', 'Maximum tokens per generation', 0, strftime('%s', 'now') * 1000),
    ('temperature', '0.7', 'number', 'Generation temperature (0-2)', 0, strftime('%s', 'now') * 1000),
    ('daily_limit', '50', 'number', 'Maximum generations per day', 0, strftime('%s', 'now') * 1000),
    ('auto_publish', 'true', 'boolean', 'Automatically publish generated content', 0, strftime('%s', 'now') * 1000),
    ('default_language', 'en', 'string', 'Default content language', 0, strftime('%s', 'now') * 1000),
    ('include_images', 'true', 'boolean', 'Include images in generated posts by default', 0, strftime('%s', 'now') * 1000);

-- ============================================
-- Add generation_count and stats to automation_paths
-- ============================================
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS
-- Run these manually if columns don't exist:
-- ALTER TABLE automation_paths ADD COLUMN generation_count INTEGER DEFAULT 0;
-- ALTER TABLE automation_paths ADD COLUMN success_count INTEGER DEFAULT 0;
-- ALTER TABLE automation_paths ADD COLUMN failure_count INTEGER DEFAULT 0;
-- ALTER TABLE automation_paths ADD COLUMN total_tokens_used INTEGER DEFAULT 0;
