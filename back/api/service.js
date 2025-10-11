const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
const Kad = require('../models/service/kad');
const Order = require('../models/service/order');

// ===================
// TEST route
// ===================

router.get('/', (req, res) => {
  res.json({ message: 'Service Provider route working' });
});
router.get('/kad', async (req, res) => {
  try {
    const kads = await Kad.getAll();
    res.json(kads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ===================
// 
// ===================
// GET all orders
router.get('/Order', verifyToken, requireRole('service'), async (req, res) => {
  try {
    const status = req.query.status || 'Available';
    const ordersList = await Order.getAll();
    const filtered = ordersList.filter(o => o.status_name === status);
    res.json(filtered);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;