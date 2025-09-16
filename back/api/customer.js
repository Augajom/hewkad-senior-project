const express = require('express');
const router = express.Router();
const History = require('../models/customer/History');

router.get('/:status', async (req, res) => {
  const status = req.params.status;
  const userId = req.query.userId || null;  // ส่ง userId ผ่าน query string เช่น ?userId=1

  try {
    const posts = await History.getByStatus(status, userId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});



module.exports = router;
