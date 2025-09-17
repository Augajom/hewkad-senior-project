const express = require('express');
const router = express.Router();
const History = require('../models/customer/History.js');
const verifyToken = require('../utils/verifyToken.js');

router.get('/:status', verifyToken, async (req, res) => {
  const status = req.params.status;
  const userId = req.user.id;

  try {
    const posts = await History.getByStatus(status, userId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

module.exports = router; // 👈 this is required!
