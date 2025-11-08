const express = require('express');
const router = express.Router();
const multer = require('multer');
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');

const Post = require('../models/customer/Posts');
const History = require('../models/customer/History');
const Kad = require('../models/customer/Kad');
const Ordering = require('../models/customer/Ordering');
const Report = require('../models/customer/Report');
const UserRole = require('../models/customer/UserRoles');
const bank = require('../models/customer/bank')
const QRCode = require("qrcode");
const { sendOrderReceivedEmail } = require('../utils/notification');
const promptpay = require("promptpay-qr");
const getName = require('../models/getName')
const cron = require("node-cron");

const upload = multer();

// ===================
// GET KAD options
// ===================
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
// GET all posts
// ===================
// GET all posts
router.get('/posts', async (req, res) => {
  try {
    const status = req.query.status || 'Available';

    // เรียกจาก model
    const postsList = await Post.getAll();

    // กรองตาม status ถ้าต้องการ
    const filtered = postsList.filter(p => p.status_name === status);

    res.json(filtered);
  } catch (err) {
    console.error('Failed to get posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// ===================
// CREATE post
// ===================
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const {
      kad_id,
      store_name,
      product,
      service_fee,
      price,
      delivery,
      delivery_at
    } = req.body;

    // 2. ดึง user_id จาก token
    const user_id = req.user.id;

    // 3. ค้นหา profile_id ที่ถูกต้อง 🚨
    const [profileRows] = await db.promise().query(
      'SELECT id FROM profile WHERE user_id = ?',
      [user_id]
    );

    // 4. เช็กว่าเจอโปรไฟล์หรือไม่
    if (profileRows.length === 0) {
      return res.status(404).json({ message: "Profile not found for this user." });
    }
    const profile_id = profileRows[0].id;

    const status_id = 1;

    const newPost = await Post.create(
      kad_id,
      store_name,
      product,
      service_fee,
      price,
      user_id,
      profile_id,
      status_id,
      delivery,
      delivery_at
    );

    res.status(201).json(newPost);
  } catch (err) {
    console.error('Create post error:', err);
    // ❌ อย่าส่ง err.message ตรงๆ ให้ส่ง Error object ที่มี code ด้วย
    res.status(500).json({ message: "Database error", error: err });
  }
});


// ===================
// EDIT post
// ===================

router.put('/posts/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // ดึงโพสต์ก่อน
    const existingPost = await Post.getById(postId);
    if (!existingPost) return res.status(404).json({ message: 'Post not found' });

    // ตรวจสอบว่าเป็นเจ้าของโพสต์
    if (existingPost.user_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own post' });
    }

    const fields = {
      kad_id: req.body.kad_id,
      store_name: req.body.store_name,
      product: req.body.product,
      service_fee: req.body.service_fee,
      price: req.body.price,
      delivery: req.body.delivery,
      delivery_at: req.body.delivery_at,
    };

    const updated = await Post.update(postId, fields);
    if (!updated) return res.status(400).json({ message: 'Nothing to update' });

    const updatedPost = await Post.getById(postId);
    res.json(updatedPost);

  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ===================
// DELETE post
// ===================
router.delete('/posts/:postId', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.getById(postId); // <-- ใช้ getById
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user_id !== userId) return res.status(403).json({ message: 'You can only delete your own post' });

    await Post.delete(postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// ===================
// GET history by status
// ===================
router.get("/history/:status", verifyToken, async (req, res) => {
  try {
    const { status } = req.params;
    const userId = req.user.id;

    // status "All" = ดึงทุกโพสต์
    const posts = await History.getByStatus(status, userId);

    res.json(posts);
  } catch (err) {
    console.error("❌ Error fetching history:", err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
});




router.get('/ordering', verifyToken, async (req, res) => {
  try {
    const { status } = req.query; // รับ status จาก query
    const statuses = status ? [status] : ['Rider Received', 'Ordering', 'Order Received'];

    const posts = await Ordering.getByStatus(statuses, req.user.id);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// router.put('/orders/:id', async (req, res) => {
//   const orderId = req.params.id;

//   try {
//     // ✅ อัปเดตสถานะ
//     await Ordering.updateStatus(orderId, "Rider Received");

//     // ✅ ดึงข้อมูลเจ้าของโพสต์
//     const orderInfo = await Ordering.getOwnerEmail(orderId);
//     const { email, nickname, product, store_name } = orderInfo;

//     // ✅ ส่งอีเมล
//     await sendOrderReceivedEmail(email, nickname, product, store_name);

//     res.json({ success: true, message: "Order updated and email sent" });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ success: false, message: err.message });
//   }
// });
router.put('/confirmorder/:id', async (req, res) => {
  const orderId = req.params.id;

  try {
    const result = await Ordering.updateStatus(orderId, 'Complete');
    res.json({ success: true, message: 'Order confirmed', data: result });
  } catch (err) {
    console.error(err);
    if (err.message.includes('not found')) {
      return res.status(404).json({ success: false, message: err.message });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


// GET /customer/payment/qr/:orderId
router.get("/payment/qr/:orderId", async (req, res) => {
  try {
    const { orderId } = req.params;

    // 1) ดึงข้อมูล order จาก DB
    const sql = `SELECT price, service_fee FROM posts WHERE id = ?`;
    db.query(sql, [orderId], async (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0) return res.status(404).json({ error: "Order not found" });

      const order = results[0];
      const amount = parseFloat(order.price) + parseFloat(order.service_fee || 0);

      const promptPayId = "1600101968836"; // 👈 เปลี่ยนเป็นของคุณ

      const payload = require("promptpay-qr")(promptPayId, { amount });
      const QRCode = require("qrcode");

      const qrImage = await QRCode.toDataURL(payload);

      res.json({ success: true, amount, qr: qrImage });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "QR generation failed" });
  }
});

router.post("/upload-slip", upload.single("files"), async (req, res) => {
  try {
    const formData = new FormData();
    formData.append("files", new Blob([req.file.buffer]), req.file.originalname);

    const response = await fetch("https://api.slipok.com/api/line/apikey/54397", {
      method: "POST",
      headers: { "x-authorization": "SLIPOKSP5002K" },
      body: formData,
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload slip" });
  }
});








// ====================
// 📌 POST /reports
// ====================
router.post('/reports', verifyToken, (req, res, next) => {
  const fs = require('fs');
  const multer = require('multer');
  const path = require('path');

  const reportDir = path.join(__dirname, '..', 'uploads', 'reports');
  if (!fs.existsSync(reportDir)) fs.mkdirSync(reportDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, reportDir),
    filename: (req, file, cb) => {
      if (!req.user || !req.user.id) return cb(new Error("User ID undefined"));
      const uniqueSuffix = Date.now() + path.extname(file.originalname);
      cb(null, `report_${req.user.id}_${uniqueSuffix}`);
    }
  });

  const upload = multer({ storage }).single('image');
  upload(req, res, (err) => {
    if (err) return res.status(500).json({ message: err.message });
    next();
  });
}, async (req, res) => {
  // route logic
  const { post_id, reason_id, detail } = req.body;
  const reporter_id = req.user.id;
  const report_file = req.file ? `/uploads/reports/${req.file.filename}` : null;

  await Report.create(post_id, reporter_id, reason_id, detail, report_file);
  await Ordering.updateStatus(post_id, 'Reporting');

  res.json({ success: true, message: 'Report submitted successfully' });
});


// GET /customer/reports/:postId
router.get('/reports/:postId', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const reports = await Report.getReportsByPost(postId);
    res.json(reports);
  } catch (err) {
    console.error("Get reports error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /customer/report-reasons
router.get('/report-reasons', async (req, res) => {
  try {
    const reasons = await Report.getReportReasons(); // เราจะต้องเพิ่มฟังก์ชันใน model
    res.json(reasons);
  } catch (err) {
    console.error("Get report reasons error:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET /customer/check-role
router.get("/check-role", verifyToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const rows = await UserRole.getCurrentRole(userId);
    if (!rows || rows.length === 0)
      return res.json({ hasServiceRole: false });

    // เช็ค role_id = 2 และ is_Active = 1
    const hasServiceRole = rows.some(
      (r) => r.role_id === 2 && r.is_Active === 1
    );

    res.json({ hasServiceRole });
  } catch (err) {
    console.error(err);
    res.status(500).json({ hasServiceRole: false });
  }
});


// GET Name by userId
router.get('/name', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id; // ดึง userId จาก token/session
    const fullName = await getName.getByUserId(userId);

    res.json({ fullName });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch fullName' });
  }
});

cron.schedule('*/10 * * * *', async () => {
  console.log('🕐 Checking for orders older than 3 hours...');
  const sql = `
    SELECT o.post_id, s.status_name, o.completed_at
    FROM orders o
    JOIN status s ON o.status_id = s.id
    WHERE s.status_name = 'Order Received'
      AND TIMESTAMPDIFF(HOUR, o.completed_at, NOW()) >= 3
  `;

  db.query(sql, async (err, results) => {
    if (err) {
      console.error('❌ Error checking orders:', err);
      return;
    }

    if (results.length === 0) return; // ไม่มีออเดอร์ครบเวลา

    console.log(`🔄 Found ${results.length} orders to auto-complete...`);

    for (const order of results) {
      try {
        await Ordering.updateStatus(order.post_id, 'Complete');
        console.log(`✅ Order #${order.post_id} set to Complete`);
      } catch (error) {
        console.error(`❌ Failed to update order #${order.post_id}:`, error.message);
      }
    }
  });
});

router.get('/banks', async (req, res) => {
  try {
    const list = await bank.getAll();
    res.json(list);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;


