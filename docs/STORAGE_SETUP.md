# Fooodis Blog - Cloudflare Storage Setup Guide

This guide explains how to set up the required Cloudflare storage services (D1, R2, KV) for the Fooodis Blog system.

## Storage Overview

| Service | Purpose | Used By |
|---------|---------|---------|
| **D1 Database** | Blog posts, categories, tags, media metadata, settings | All sections |
| **R2 Bucket** | Media file storage (images, videos) | Create Post, Media Library |
| **KV Namespace** | Fast caching for settings, rate limiting | Settings, Blog Frontend |

## Prerequisites

1. A Cloudflare account with Pages/Workers enabled
2. Wrangler CLI installed: `npm install -g wrangler`
3. Authenticated with Cloudflare: `wrangler login`

---

## Step 1: Create D1 Database

### Via Cloudflare Dashboard:
1. Go to **Workers & Pages** → **D1**
2. Click **Create database**
3. Name: `fooodis-db`
4. Copy the **Database ID**

### Via Wrangler CLI:
```bash
wrangler d1 create fooodis-db
```

### Apply Migrations:
```bash
# Apply all migrations in order
wrangler d1 execute fooodis-db --file=./migrations/0001_init.sql
wrangler d1 execute fooodis-db --file=./migrations/0002_blog_posts.sql
wrangler d1 execute fooodis-db --file=./migrations/0003_complete_blog_system.sql

# Or apply the complete schema at once (for fresh setup)
wrangler d1 execute fooodis-db --file=./schema.sql
```

### Update wrangler.toml:
```toml
[[d1_databases]]
binding = "DB"
database_name = "fooodis-db"
database_id = "YOUR_DATABASE_ID_HERE"
```

---

## Step 2: Create R2 Bucket

### Via Cloudflare Dashboard:
1. Go to **R2** in Cloudflare dashboard
2. Click **Create bucket**
3. Name: `fooodis-media`
4. Location: Choose nearest region

### Via Wrangler CLI:
```bash
wrangler r2 bucket create fooodis-media
```

### Configure Public Access (for serving media):
1. Go to **R2** → **fooodis-media** → **Settings**
2. Enable **Public access** (optional - we use API serving instead)
3. Or use the `/api/media/serve/` endpoint for private serving

### Update wrangler.toml:
```toml
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "fooodis-media"
```

---

## Step 3: Create KV Namespace

### Via Cloudflare Dashboard:
1. Go to **Workers & Pages** → **KV**
2. Click **Create a namespace**
3. Name: `fooodis-cache`
4. Copy the **Namespace ID**

### Via Wrangler CLI:
```bash
wrangler kv:namespace create "FOOODIS_CACHE"
```

### Update wrangler.toml:
```toml
[[kv_namespaces]]
binding = "KV"
id = "YOUR_KV_NAMESPACE_ID_HERE"
```

---

## Step 4: Deploy

After configuring all services:

```bash
# Deploy to Cloudflare Pages
wrangler pages deploy ./

# Or if using Workers
wrangler deploy
```

---

## API Endpoints

### Blog Posts
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/blog/posts` | List all posts |
| POST | `/api/blog/posts` | Create a post |
| GET | `/api/blog/posts/:id` | Get single post |
| PUT | `/api/blog/posts/:id` | Update a post |
| DELETE | `/api/blog/posts/:id` | Delete a post |

### Categories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List categories (with subcategories) |
| POST | `/api/categories` | Create category |
| GET | `/api/categories/:id` | Get single category |
| PUT | `/api/categories/:id` | Update category |
| DELETE | `/api/categories/:id` | Delete category |

### Subcategories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subcategories` | List subcategories |
| POST | `/api/subcategories` | Create subcategory |

### Tags
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tags` | List all tags |
| POST | `/api/tags` | Create tag |
| PATCH | `/api/tags` | Bulk create tags |
| PUT | `/api/tags/:id` | Update tag |
| DELETE | `/api/tags/:id` | Delete tag |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/media` | List media files |
| POST | `/api/media` | Upload file (multipart/form-data) |
| GET | `/api/media/:id` | Get media metadata |
| PUT | `/api/media/:id` | Update media metadata |
| DELETE | `/api/media/:id` | Delete media file |
| GET | `/api/media/serve/:path` | Serve file from R2 |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get all settings |
| GET | `/api/settings?key=KEY` | Get single setting |
| PUT | `/api/settings` | Update settings |

---

## Database Schema Relationships

```
┌─────────────────┐     ┌─────────────────┐
│   categories    │────<│  subcategories  │
└─────────────────┘     └─────────────────┘
        │
        │ (name reference)
        ▼
┌─────────────────┐     ┌─────────────────┐
│   blog_posts    │────<│  featured_posts │
└─────────────────┘     └─────────────────┘
   │    │    │
   │    │    └──────────<┌─────────────────┐
   │    │                │ scheduled_posts │
   │    │                └─────────────────┘
   │    │
   │    └───────────────<┌─────────────────┐
   │                     │   post_stats    │
   │                     └─────────────────┘
   │
   └────<┌─────────────────┐     ┌─────────────────┐
         │    post_tags    │────>│      tags       │
         └─────────────────┘     └─────────────────┘

┌─────────────────┐
│  media_library  │ (stores R2 file metadata)
└─────────────────┘

┌─────────────────┐
│  blog_settings  │ (backed by KV cache)
└─────────────────┘
```

---

## Environment Variables

In your `wrangler.toml`:

```toml
[vars]
ENVIRONMENT = "production"
MAX_UPLOAD_SIZE = "10485760"  # 10MB
ALLOWED_ORIGINS = "https://fooodis.com,https://www.fooodis.com"
```

---

## Troubleshooting

### "Database not configured" error
- Ensure your D1 database ID is correct in `wrangler.toml`
- Run migrations to create tables

### "R2 bucket not configured" error
- Check that the bucket exists and binding name matches
- Verify `MEDIA_BUCKET` binding in wrangler.toml

### Media uploads failing
- Check file size (max 10MB default)
- Verify MIME type is allowed
- Check R2 bucket permissions

### Settings not persisting
- Verify KV namespace is created and bound
- Check KV namespace ID in wrangler.toml

---

## Local Development

For local development with Wrangler:

```bash
# Run local dev server with D1, R2, and KV
wrangler pages dev ./ --d1=DB --r2=MEDIA_BUCKET --kv=KV

# Or for Workers
wrangler dev
```

This will create local persistent storage for testing.
