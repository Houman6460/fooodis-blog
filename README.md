# Fooodis Blog System

A complete blog system with dashboard, blog interface, and backend API.

## Setup Instructions

### Prerequisites
- Node.js 14.x or later
- NPM 6.x or later

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```
   
3. **Access the application**:
   - Dashboard: http://localhost:3005/dashboard.html
   - Blog: http://localhost:3005/blog.html
   - Login: http://localhost:3005/login.html
   - Profile: http://localhost:3005/profile.html
   - API Health: http://localhost:3005/api/system-health

## Project Structure

```
fooodis-blog/
├── api/                 # Backend API endpoints
├── css/                 # Stylesheets
├── data/                # Data storage
├── docs/                # Documentation
├── functions/           # Cloudflare Workers functions
├── images/              # Image resources
├── js/                  # JavaScript files
│   └── modules/         # Modular JavaScript architecture
├── migrations/          # Database migrations
├── templates/           # HTML templates
├── server.js            # Express.js server
└── wrangler.toml        # Cloudflare Workers config
```

## Documentation

Detailed documentation is available in the `/docs` folder:

- **[Storage Setup](docs/STORAGE_SETUP.md)** - Cloudflare D1, R2, and KV configuration
- **[Data Persistence Fix](docs/DATA_PERSISTENCE_FIX.md)** - Solutions for data persistence issues
- **[Schedule Fix](docs/SCHEDULE_FIX.md)** - Scheduling system fixes
- **[Fixes Summary](docs/FIXES_SUMMARY.md)** - Overview of all implemented fixes

## Deployment

### Local Development
```bash
npm start
```

### Cloudflare Pages
```bash
wrangler pages deploy ./
```

See [Storage Setup](docs/STORAGE_SETUP.md) for detailed Cloudflare configuration.

## Environment Variables

Copy `.env.example` to `.env` and configure:
- OpenAI API key (for AI features)
- Cloudflare credentials (for deployment)

## Contact

For support or inquiries about the Fooodis Blog System, please contact the Fooodis Team.
