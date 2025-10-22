const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
const Kad = require('../models/service/kad');
const Order = require('../models/service/order');
const Ordering = require('../models/customer/Ordering');
const OrderHistory = require('../models/service/History');
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

router.post('/hew', verifyToken, requireRole('service'), (req, res) => {
  const { post_id, order_price, order_service_fee, delivery_address, delivery_time } = req.body;
  const rider_id = req.user.id;

  console.log("HEW payload:", req.body, "Rider ID:", rider_id);

  // 1️⃣ สร้าง order ใหม่
  const insertSql = `
    INSERT INTO orders
    (post_id, customer_id, rider_id, status_id, order_price, order_service_fee, delivery_address, delivery_time)
    SELECT id, user_id, ?, 2, ?, ?, ?, ?
    FROM posts
    WHERE id = ?
  `;
  db.query(
    insertSql,
    [rider_id, order_price, order_service_fee, delivery_address, delivery_time, post_id],
    (err, result) => {
      if (err) {
        console.error('DB error (insert orders):', err);
        return res.status(500).json({ error: err.message });
      }

      // 2️⃣ อัปเดต status ของโพสต์เป็น "Rider Received" (status_id = 2)
      const updateSql = `UPDATE posts SET status_id = 2 WHERE id = ?`;
      db.query(updateSql, [post_id], (err2) => {
        if (err2) {
          console.error('DB error (update posts):', err2);
          return res.status(500).json({ error: err2.message });
        }

        res.json({ success: true, order_id: result.insertId });
      });
    }
  );
});

router.put('/orders/:id/notification', verifyToken, requireRole('service'), async (req, res) => {
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
// GET /service/history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const riderId = req.user.id; // ดึง rider id จาก token
    const orders = await OrderHistory.getByRider(riderId);

    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch order history:", err);
    res.status(500).json({ message: "Internal Server Error" });
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