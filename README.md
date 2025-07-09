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

## Fixed Modules

This backup includes fixed modules to resolve JavaScript errors in the original codebase. The fixed modules are located in:

```
/js/modules-fixed/
```

To use these fixed modules:

1. Copy all files from `/js/modules-fixed/` to `/js/modules/`
2. These modules implement the necessary functionality for:
   - Module loading system
   - Storage management
   - API communication
   - Execution management
   - Scheduling
   - Time handling

## Important Notes

- The backend API requires Express.js and serves all static assets in the project directory.
- API endpoints for system health and recovery have been implemented.
- If you encounter any JavaScript errors, check the browser console and ensure the modules are properly loaded.
- The dashboard has been fixed to work with the modular architecture.

## File Structure

- `/api/` - Backend API endpoints
- `/assets/` - Static assets for the blog system
- `/css/` - Stylesheets
- `/images/` - Image resources
- `/js/` - JavaScript files
- `/js/modules/` - Modular JavaScript architecture
- `/templates/` - HTML templates

## Contact

For support or inquiries about the Fooodis Blog System, please contact the Fooodis Team.
