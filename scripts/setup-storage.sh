#!/bin/bash
# Fooodis Blog - Cloudflare Storage Setup Script
# This script creates and configures D1, R2, and KV storage

set -e

echo "=================================================="
echo "Fooodis Blog - Cloudflare Storage Setup"
echo "=================================================="
echo ""

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "   npm install -g wrangler"
    exit 1
fi

# Check if logged in
echo "Checking Cloudflare authentication..."
if ! wrangler whoami &> /dev/null; then
    echo "❌ Not authenticated. Please run: wrangler login"
    exit 1
fi
echo "✅ Authenticated with Cloudflare"
echo ""

# Create D1 Database
echo "Creating D1 Database..."
D1_OUTPUT=$(wrangler d1 create fooodis-db 2>&1 || true)
if echo "$D1_OUTPUT" | grep -q "already exists"; then
    echo "ℹ️  D1 database 'fooodis-db' already exists"
else
    echo "✅ D1 database created"
    echo "$D1_OUTPUT"
fi
echo ""

# Apply migrations
echo "Applying D1 migrations..."
echo "  → Running 0001_init.sql..."
wrangler d1 execute fooodis-db --file=./migrations/0001_init.sql --remote || true
echo "  → Running 0002_blog_posts.sql..."
wrangler d1 execute fooodis-db --file=./migrations/0002_blog_posts.sql --remote || true
echo "  → Running 0003_complete_blog_system.sql..."
wrangler d1 execute fooodis-db --file=./migrations/0003_complete_blog_system.sql --remote || true
echo "✅ Migrations applied"
echo ""

# Create R2 Bucket
echo "Creating R2 Bucket..."
R2_OUTPUT=$(wrangler r2 bucket create fooodis-media 2>&1 || true)
if echo "$R2_OUTPUT" | grep -q "already exists"; then
    echo "ℹ️  R2 bucket 'fooodis-media' already exists"
else
    echo "✅ R2 bucket created"
fi
echo ""

# Create KV Namespace
echo "Creating KV Namespace..."
KV_OUTPUT=$(wrangler kv:namespace create "FOOODIS_CACHE" 2>&1 || true)
if echo "$KV_OUTPUT" | grep -q "already exists"; then
    echo "ℹ️  KV namespace already exists"
else
    echo "✅ KV namespace created"
    echo "$KV_OUTPUT"
    echo ""
    echo "⚠️  IMPORTANT: Update wrangler.toml with the KV namespace ID shown above!"
fi
echo ""

# Get D1 database info
echo "Getting D1 database info..."
wrangler d1 info fooodis-db 2>/dev/null || echo "Run 'wrangler d1 info fooodis-db' to get database ID"
echo ""

echo "=================================================="
echo "Setup Complete!"
echo "=================================================="
echo ""
echo "Next steps:"
echo "1. Update wrangler.toml with the IDs shown above"
echo "2. Deploy: wrangler pages deploy ./"
echo "3. Test the API endpoints"
echo ""
echo "See STORAGE_SETUP.md for full documentation."
