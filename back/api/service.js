const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
const Kad = require('../models/service/kad');
const Order = require('../models/service/order');
const Ordering = require('../models/customer/Ordering');
const { sendOrderReceivedEmail } = require('../utils/notification');


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
    const filtered = ordersList.filter(o => status.split(',').includes(o.status_name));
    res.json(filtered);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
router.put('/orders/:id', verifyToken, requireRole('service'), async (req, res) => {
  try {
    const orderId = req.params.id;
    const senderEmail = req.user.email; // ✅ จาก verifyToken

    // ✅ 1. อัปเดตสถานะ
    await Ordering.updateStatus(orderId, 'Rider Received');

    // ✅ 2. ดึงข้อมูลอีเมลเจ้าของร้าน
    const { email: receiverEmail, nickname, product, store_name } = await Ordering.getOwnerEmail(orderId);

    // ✅ 3. ส่งอีเมล พร้อมระบุผู้ส่ง
    await sendOrderReceivedEmail(receiverEmail, nickname, product, store_name, senderEmail);

    res.json({
      success: true,
      message: 'Order updated and email sent',
      
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/orderingstatus', verifyToken, requireRole('service'), async (req, res) => {
  try {
    const userId = req.user.id; // ดึง user ปัจจุบัน
    const statusQuery = req.query.status || "Rider Received,Ordering,Order Received";

    // แยก status เป็น array และ trim
    const statusArray = statusQuery.split(",").map(s => s.trim());

    // ดึงทุกออเดอร์
    const ordersList = await Order.getAll();

    // กรองออเดอร์: ของ user ปัจจุบัน + status ที่ต้องการ
    const filtered = ordersList.filter(
      o => o.user_id === userId && statusArray.includes(o.status_name)
    );

    res.json(filtered);
  } catch (err) {
    console.error('Failed to get orders:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



module.exports = router;