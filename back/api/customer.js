const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Customer route working' });
});

router.get('/test', (req, res) => {
  res.json({ message: 'You have customer access!' });
});

module.exports = router;