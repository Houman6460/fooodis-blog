#!/bin/bash

# Bypass SSL Certificate errors
export NODE_TLS_REJECT_UNAUTHORIZED=0

echo "Applying Blog Posts Migration to D1..."

# Run Migrations
echo "Running migration 0002_blog_posts.sql (Local)..."
npx wrangler d1 execute fooodis-db --local --file=migrations/0002_blog_posts.sql -y

echo "Running migration 0002_blog_posts.sql (Remote)..."
npx wrangler d1 execute fooodis-db --remote --file=migrations/0002_blog_posts.sql -y

echo "✅ Blog Posts Backend Setup Complete!"
