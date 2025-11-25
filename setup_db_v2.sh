#!/bin/bash

# Bypass SSL Certificate errors (e.g. corporate proxy/VPN)
export NODE_TLS_REJECT_UNAUTHORIZED=0

# Set specific Account ID to avoid ambiguity
export CLOUDFLARE_ACCOUNT_ID=a61ca8dc9ea0436f71f32d531ed6edaa

echo "Setting up Fooodis D1 Database..."

# Try to verify existing authentication (Browser or Token)
echo "Checking authentication..."
npx wrangler whoami > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Authenticated!"
else
    echo "⚠️  Not authenticated."
    echo "Do you have an API Token? (y/n)"
    read -r has_token
    
    if [[ "$has_token" == "y" || "$has_token" == "Y" ]]; then
        echo "Please enter your Cloudflare API Token:"
        read -r token
        export CLOUDFLARE_API_TOKEN=$token
        
        # Verify again
        npx wrangler whoami
        if [ $? -ne 0 ]; then
            echo "❌ Invalid Token."
            exit 1
        fi
    else
        echo "Attempting browser login..."
        npx wrangler login
        if [ $? -ne 0 ]; then
            echo "❌ Login failed."
            exit 1
        fi
    fi
fi

# Create Database
echo "Creating D1 Database 'fooodis-db'..."
create_output=$(npx wrangler d1 create fooodis-db)
echo "$create_output"

# Check if it failed because it already exists
if echo "$create_output" | grep -q "already exists"; then
    echo "Database already exists. Fetching ID..."
    # List DBs and find the ID
    create_output=$(npx wrangler d1 list --json)
    # Use node to parse json and find the id for 'fooodis-db'
    db_id=$(echo "$create_output" | node -e "const fs=require('fs'); const input=fs.readFileSync(0, 'utf-8'); try { const dbs=JSON.parse(input); const db=dbs.find(d=>d.name==='fooodis-db'); if(db) console.log(db.uuid); } catch(e){}")
else
    # Extract Database ID from creation output
    db_id=$(echo "$create_output" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}')
fi

if [ -z "$db_id" ]; then
    echo "⚠️  Could not auto-detect Database ID."
    echo "Please enter the Database ID (UUID) from Cloudflare Dashboard > D1 > fooodis-db:"
    read -r db_id
fi

echo "Using Database ID: $db_id"

# Update wrangler.toml
echo "Updating wrangler.toml..."
# We need to be careful to replace the WRONG id if it was set previously
if grep -q "database_id" wrangler.toml; then
    sed -i '' "s/database_id = \"[^\"]*\"/database_id = \"$db_id\"/g" wrangler.toml
else
    echo "database_id not found in wrangler.toml, appending..."
    # This is a fallback, ideally the file structure is known
fi

# Run Migrations
echo "Running migrations (Local)..."
npx wrangler d1 execute fooodis-db --local --file=migrations/0001_init.sql

echo "Running migrations (Remote)..."
npx wrangler d1 execute fooodis-db --remote --file=migrations/0001_init.sql

echo "✅ Setup complete!"
