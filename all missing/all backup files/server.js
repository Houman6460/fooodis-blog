/**
 * Fooodis Blog System Server
 * Simple Express server to serve the blog system files
 */

const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3005;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Start the server
app.listen(PORT, () => {
  console.log(`Fooodis Blog System server running on http://localhost:${PORT}`);
  console.log(`- Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`- Login: http://localhost:${PORT}/login.html`);
  console.log(`- Profile: http://localhost:${PORT}/profile.html`);
});