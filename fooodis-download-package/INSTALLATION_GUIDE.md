
# Fooodis Blog System - Installation Guide

## Quick Start

### 1. System Requirements
- **Node.js**: Version 14.0.0 or higher
- **npm**: Comes with Node.js
- **Operating System**: Windows, macOS, or Linux
- **RAM**: Minimum 2GB recommended
- **Storage**: At least 500MB free space

### 2. Download and Extract
1. Download the `fooodis-download-package.zip` file
2. Extract it to your desired location
3. Open terminal/command prompt in the extracted folder

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
```bash
npm start
```

### 5. Access the Application
- **Main Site**: http://localhost:5000
- **Dashboard**: http://localhost:5000/dashboard.html
- **Login**: http://localhost:5000/login.html

## Detailed Setup Instructions

### For Windows Users:

1. **Install Node.js**:
   - Download from https://nodejs.org/
   - Run the installer and follow the prompts
   - Verify installation: `node --version` and `npm --version`

2. **Extract and Setup**:
   - Extract the zip file to `C:\fooodis-blog-system\`
   - Open Command Prompt as Administrator
   - Navigate: `cd C:\fooodis-blog-system\`
   - Install: `npm install`
   - Start: `npm start`

### For macOS Users:

1. **Install Node.js**:
   - Download from https://nodejs.org/
   - Or use Homebrew: `brew install node`
   - Verify: `node --version` and `npm --version`

2. **Extract and Setup**:
   - Extract to `~/fooodis-blog-system/`
   - Open Terminal
   - Navigate: `cd ~/fooodis-blog-system/`
   - Install: `npm install`
   - Start: `npm start`

### For Linux Users:

1. **Install Node.js**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm
   
   # CentOS/RHEL
   sudo yum install nodejs npm
   
   # Arch Linux
   sudo pacman -S nodejs npm
   ```

2. **Extract and Setup**:
   ```bash
   cd ~/fooodis-blog-system/
   npm install
   npm start
   ```

## Configuration Steps

### 1. First Time Setup
1. Navigate to http://localhost:5000/dashboard.html
2. Go to "AI Config" section
3. Enter your OpenAI API key (required for AI features)
4. Configure your preferences

### 2. User Management
1. Access the login page at http://localhost:5000/login.html
2. Create your admin account
3. Set up user profiles as needed

### 3. Content Setup
1. Access the dashboard
2. Create your first blog post
3. Set up email templates
4. Configure chatbot responses

## Development Mode

For development with auto-restart:
```bash
npm run dev
```

This uses nodemon to automatically restart the server when files change.

## Production Deployment

### 1. Environment Variables
Create a `.env` file:
```
NODE_ENV=production
PORT=5000
```

### 2. Start in Production
```bash
npm start
```

### 3. Process Management (Optional)
For production, consider using PM2:
```bash
npm install -g pm2
pm2 start server.js --name fooodis-blog
pm2 startup
pm2 save
```

## Troubleshooting

### Common Issues:

1. **"Cannot find module" errors**:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Port already in use**:
   ```bash
   # Find process using port 5000
   lsof -i :5000  # macOS/Linux
   netstat -ano | findstr :5000  # Windows
   
   # Or use different port
   PORT=3000 npm start
   ```

3. **Permission denied errors**:
   ```bash
   # macOS/Linux
   sudo npm install
   
   # Windows: Run Command Prompt as Administrator
   ```

4. **EACCES errors**:
   ```bash
   # Fix npm permissions
   npm config set prefix '~/.npm-global'
   export PATH=~/.npm-global/bin:$PATH
   ```

### Getting Help:

1. Check the console for error messages
2. Verify Node.js and npm versions
3. Ensure all dependencies installed correctly
4. Check network connectivity for API features

## Advanced Configuration

### Custom Port:
```bash
PORT=8080 npm start
```

### Custom Environment:
```bash
NODE_ENV=development npm start
```

### Memory Limits:
```bash
node --max-old-space-size=4096 server.js
```

## Features Overview

After installation, you'll have access to:
- **Dashboard**: Complete admin interface
- **Blog System**: Post creation and management
- **AI Automation**: Content generation with OpenAI
- **Email Marketing**: Campaign management
- **Chatbot**: Customer support automation
- **Analytics**: Performance tracking
- **User Management**: Authentication and profiles

## Next Steps

1. Configure your OpenAI API key
2. Create your first blog post
3. Set up email templates
4. Customize chatbot responses
5. Configure automation workflows

The system is now ready for use!
