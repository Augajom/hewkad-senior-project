const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
const Kad = require('../models/service/kad');
const Order = require('../models/service/order');
const OrderRider = require('../models/service/orderrider');
const Ordering = require('../models/customer/Ordering');
const OrderHistory = require('../models/service/History');
const Proof = require('../models/service/proof');
const Orderingnoti = require('../models/customer/Orderingnoti');
const { sendOrderReceivedEmail } = require('../utils/notification');
const multer = require('multer');
const path = require('path'); // ✅ ต้องมีบรรทัดนี้
const fs = require('fs');
const ServiceRole = require('../models/service/ServiceRole');
// ===================
// TEST route
// ===================

router.get('/', (req, res) => {
  res.json({ message: 'Service Provider route working' });
});
router.get('/kad', async (req, res) => {
  try {
    const kads = await Kad.getAll()
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

router.get("/orders", verifyToken, async (req, res) => {
  if (!req.user || !req.user.id) 
    return res.status(401).json({ message: "Unauthorized" });

  const rider_id = req.user.id;

  try {
    // ดึง order ของ rider คนนี้
    let orders = await OrderRider.getByRider(rider_id);

    // กรองเฉพาะ status_id 2,3,4
    orders = orders.filter(o => [2, 3, 4].includes(o.status_id));

    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ message: err.message });
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

    // 1️⃣ ดึง postId และเจ้าของโพสต์
    const postId = await Orderingnoti.getPostIdByOrderId(orderId);
    const ownerInfo = await Orderingnoti.getOwnerEmailByPostId(postId);

    console.log("Notification for order ID:", orderId);

    // 2️⃣ อัปเดต status ของ order & post
    await Orderingnoti.updateStatus(orderId, 'Rider Received');
    console.log("Status updated");

    // 3️⃣ ส่งอีเมลแจ้งเจ้าของ
    await sendOrderReceivedEmail(
      ownerInfo.email,
      ownerInfo.nickname,
      ownerInfo.product,
      ownerInfo.store_name,
      req.user.email
    );
    console.log("Email sent");

    res.json({ success: true, message: 'Order updated and email sent' });
  } catch (err) {
    console.error("Notification error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});


// GET /service/history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const riderId = req.user.id; // ดึง rider id จาก token
    const orders = await OrderHistory.getByRider(riderId); // ใช้ฟังก์ชันตัวเดียวกับ model

    res.json(orders);
  } catch (err) {
    console.error("Failed to fetch complete order history:", err);
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

const UPLOAD_DIR = path.join(__dirname, "..", "uploads", "proofs");
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// =====================
// 2️⃣ Multer Storage
// =====================
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || ".jpg").toLowerCase();
    const uid = req.user?.id || "u";
    cb(null, `proof_${uid}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

// =====================
// 3️⃣ Route: Upload Proof + Update Status
// =====================
router.post(
  "/orders/:id/upload-proof",
  verifyToken,
  requireRole("service"),
  upload.single("proof"),
  async (req, res) => {
    const orderId = req.params.id;

    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const filePath = `/uploads/proofs/${req.file.filename}`; // URL สำหรับ frontend

    console.log("Uploading proof for order:", orderId, "file:", filePath);

    try {
      // 1️⃣ อัปเดต proof_url ลง DB
      const result = await Proof.saveProofUrl(orderId, filePath);

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Order not found" });

      // 2️⃣ เปลี่ยนสถานะเป็น "Order Received"
      await Ordering.updateStatus(orderId, "Order Received");

      res.json({ message: "Upload success", proof_url: filePath, status: "Order Received" });
    } catch (err) {
      console.error("DB Error:", err);
      res.status(500).json({ message: "Database error", error: err.message });
    }
  }
);

// GET /service/check-role
router.get("/check-role", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await ServiceRole.getCurrentRole(userId);
    if (!rows || rows.length === 0)
      return res.json({ hasServiceRole: false });

    // เช็ค role_id = 1 และ is_Active = 1
    const hasServiceRole = rows.some(
      (r) => r.role_id === 3 && r.is_Active === 1
    );

    res.json({ hasServiceRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ hasServiceRole: false });
  }
});

module.exports = router;