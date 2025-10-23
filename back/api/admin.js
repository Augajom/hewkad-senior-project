const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// models
const User = require('../models/userModel');
const Payment = require('../models/admin/Payment');

router.get('/', (req, res) => {
  res.json({ message: 'Admin route working' });
});

// Register
router.post('/register', async (req, res) => {
  const {
    username,
    password,
    email,
    name,
    phone_num,
    bank,
    acc_number,
    acc_owner
  } = req.body;

  if (
    !username ||
    !password ||
    !email ||
    !name ||
    !phone_num ||
    !bank ||
    !acc_number ||
    !acc_owner
  ) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const newUser = await User.create(
      username,
      password,
      email,
      name,
      phone_num,
      bank,
      acc_number,
      acc_owner
    );
    res.json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /orders
 * ดึง orders ทั้งหมดพร้อมข้อมูล customer, rider, status, order_price, service_fee, ordered_at และ rider bank account
 */
router.get('/payment', async (req, res) => {
  try {
    const orders = await Payment.getAll();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/payment/history', async (req, res) => {
  try {
    const orders = await Payment.getHistory();
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /orders/:id
 * ดึง order ตาม ID
 */
router.get('/payment/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const order = await Payment.getById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/payment/reject/:orderId', async (req, res) => {
  try {
    // ตรวจสอบว่า user มี role 'admin'
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const orderId = req.params.orderId;
    await Payment.updateStatus(orderId, 7, "Reject");

    res.json({ message: 'Order rejected successfully', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/payment/approve/:orderId', async (req, res) => {
  try {
    if (!req.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Forbidden: Admins only' });
    }

    const { orderId } = req.params;
    await Payment.updateStatus(orderId, 8, "Completed");

    res.json({ message: 'Payment approved successfully', orderId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
