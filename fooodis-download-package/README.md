
# Fooodis Blog System - Complete Package

## Overview
This is a complete, self-contained Fooodis blog system with AI automation, email marketing, and dashboard management capabilities.

## Features
- **Dashboard Management**: Complete admin dashboard with navigation
- **AI Content Automation**: OpenAI integration for automated content generation
- **Email Marketing**: Email builder with templates and subscriber management
- **Blog System**: Full blog functionality with post management
- **Chatbot Integration**: AI-powered chatbot for customer support
- **User Authentication**: Login and profile management
- **Analytics**: Post statistics and engagement tracking

## Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

## Installation

1. Extract the package to your desired location
2. Navigate to the project directory:
   ```bash
   cd fooodis-download-package
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables** (Optional):
   Create a `.env` file in the root directory and add:
   ```
   PORT=5000
   NODE_ENV=production
   ```

2. **OpenAI API Key**:
   - Navigate to the AI Config section in the dashboard
   - Enter your OpenAI API key
   - The system will save it automatically

## Running the Application

### Development Mode (with auto-restart):
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The application will be available at:
- **Main Site**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard.html
- **Login**: http://localhost:5000/login.html
- **Blog**: http://localhost:5000/blog.html

## System Architecture

### Backend (Node.js/Express)
- **Server**: `server.js` - Main application server
- **APIs**: `api/` directory contains all API endpoints
  - `auth.js` - Authentication endpoints
  - `chatbot.js` - Chatbot functionality
  - `database.js` - Database operations
  - `system-health.js` - System monitoring
  - `tickets.js` - Support ticket system

### Frontend
- **Dashboard**: `dashboard.html` - Main admin interface
- **Blog**: `blog.html` - Public blog interface
- **Login**: `login.html` - Authentication page
- **Profile**: `profile.html` - User profile management

### Assets
- **CSS**: `css/` directory - All stylesheets
- **JavaScript**: `js/` directory - All client-side scripts
- **Images**: `images/` directory - All media files
- **Templates**: `templates/` directory - Email templates

## Key Features Configuration

### AI Automation
1. Go to Dashboard → AI Config
2. Enter OpenAI API Key
3. Configure AI assistants
4. Set up automation paths in AI Automation section

### Email Marketing
1. Access Email Builder from dashboard
2. Create templates and campaigns
3. Manage subscriber lists
4. Set up automated email sequences

### Blog Management
1. Create and edit posts from dashboard
2. Schedule posts for future publication
3. Manage categories and tags
4. Monitor post analytics

### Chatbot Setup
1. Configure chatbot settings in dashboard
2. Set up ready answers for common questions
3. Monitor conversations and ratings
4. Customize chatbot appearance

## Data Storage
- **Local Storage**: Browser-based storage for user preferences
- **File Storage**: JSON files for persistent data storage
- **Session Storage**: Temporary data during user sessions

## Security Features
- Rate limiting on API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- JWT token authentication

## Troubleshooting

### Common Issues:

1. **Port Already in Use**:
   ```bash
   # Change port in server.js or set PORT environment variable
   PORT=3000 npm start
   ```

2. **Dependencies Issues**:
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **OpenAI API Issues**:
   - Verify your API key is valid
   - Check API usage limits
   - Ensure proper network connectivity

4. **File Permissions**:
   ```bash
   # Fix file permissions if needed
   chmod -R 755 .
   ```

## Development

### File Structure:
```
fooodis-download-package/
├── api/                 # Backend API endpoints
├── css/                 # Stylesheets
├── js/                  # Client-side JavaScript
├── images/              # Media files
├── templates/           # Email templates
├── data/                # JSON data files
├── dashboard.html       # Admin dashboard
├── blog.html           # Public blog
├── login.html          # Authentication
├── server.js           # Main server
└── package.json        # Dependencies
```

### Adding New Features:
1. Add API endpoints in `api/` directory
2. Create corresponding frontend JavaScript in `js/`
3. Add stylesheets in `css/`
4. Update navigation in dashboard if needed

## Support
- Check the console for error messages
- Verify all dependencies are installed
- Ensure Node.js version compatibility
- Check network connectivity for API calls

## License
This project is licensed under the ISC License.

## Version
1.0.0 - Complete package with all features
