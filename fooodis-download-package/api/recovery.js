
const express = require('express');
const router = express.Router();

// Recovery endpoint
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Recovery API is working',
    timestamp: new Date().toISOString()
  });
});

// Recovery status endpoint
router.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    services: {
      database: 'ok',
      storage: 'ok',
      api: 'ok'
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
