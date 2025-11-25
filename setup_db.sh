#!/bin/bash

echo "Setting up Fooodis D1 Database..."

# Check if token is present
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "Please enter your Cloudflare API Token:"
    read -r token
    export CLOUDFLARE_API_TOKEN=$token
fi

# Verify token
echo "Verifying token..."
npx wrangler whoami

if [ $? -ne 0 ]; then
    echo "Error: Failed to authenticate. Please check your token and network connection."
    exit 1
fi

# Create Database
echo "Creating D1 Database 'fooodis-db'..."
create_output=$(npx wrangler d1 create fooodis-db)
echo "$create_output"

# Extract Database ID
# Assuming output contains: "database_id": "xxx" or similar text
db_id=$(echo "$create_output" | grep -oE '[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}')

if [ -z "$db_id" ]; then
    echo "Could not auto-detect Database ID. Please copy it from the output above and enter it here:"
    read -r db_id
fi

echo "Database ID: $db_id"

# Update wrangler.toml
echo "Updating wrangler.toml..."
sed -i '' "s/PLACEHOLDER_DB_ID/$db_id/g" wrangler.toml

# Run Migrations
echo "Running migrations (Local)..."
npx wrangler d1 execute fooodis-db --local --file=migrations/0001_init.sql

echo "Running migrations (Remote)..."
npx wrangler d1 execute fooodis-db --remote --file=migrations/0001_init.sql

echo "Setup complete!"
