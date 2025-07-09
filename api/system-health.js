
const express = require('express');
const router = express.Router();

// System health endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.json({
    status: 'healthy',
    checks: {
      server: 'ok',
      memory: process.memoryUsage().heapUsed < 100 * 1024 * 1024 ? 'ok' : 'warning',
      uptime: process.uptime() > 0 ? 'ok' : 'error'
    },
    metrics: {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
