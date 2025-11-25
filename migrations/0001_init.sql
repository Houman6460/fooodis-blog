-- Migration number: 0001 	 2024-05-25
-- Create automation_paths table

CREATE TABLE IF NOT EXISTS automation_paths (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    content_type TEXT,
    assistant_id TEXT,
    category TEXT,
    subcategory TEXT,
    topics TEXT, -- JSON string
    mode TEXT,
    schedule_type TEXT,
    schedule_time TEXT,
    prompt_template TEXT,
    include_images INTEGER DEFAULT 0, -- Boolean stored as 0/1
    media_folder TEXT,
    languages TEXT, -- JSON string
    created_at INTEGER,
    last_run INTEGER,
    status TEXT DEFAULT 'active'
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_automation_paths_status ON automation_paths(status);
