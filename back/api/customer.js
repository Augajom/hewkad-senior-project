const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');

const Post = require('../models/customer/Posts');
const History = require('../models/customer/History');
const Kad = require('../models/customer/Kad');
const Ordering = require('../models/customer/Ordering');
const Report = require('../models/customer/Report');
const UserRole = require('../models/customer/UserRoles');
const QRCode = require("qrcode");
const promptpay = require("promptpay-qr");

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
      status_id,
      delivery,
      delivery_at
    } = req.body;

    const user_id = req.user.id;
    const profile_id = user_id; 

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
    res.status(500).json({ message: err.message });
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
router.get('/history/:status', verifyToken, async (req, res) => {
  try {
    const status = req.params.status;
    const userId = req.user.id;

    const posts = await History.getByStatus(status, userId);
    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
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
router.put('/orders/:id', async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    const result = await Ordering.updateStatus(orderId, status);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
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

      const promptPayId = "0817270727"; // 👈 เปลี่ยนเป็นของคุณ

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


// POST /customer/reports
router.post('/reports', verifyToken, async (req, res) => {
  try {
    const { post_id, reason_id, detail } = req.body;
    const reporter_id = req.user.id;

    if (!post_id || !reason_id) {
      return res.status(400).json({ message: 'Missing fields' });
    }

    // สร้าง report
    await Report.create(post_id, reporter_id, reason_id, detail);

    // อัปเดตสถานะโพสต์เป็น Reported
    await Report.updatePostStatusToReported(post_id);

    res.json({ success: true, message: 'Report submitted and status updated' });
  } catch (err) {
    console.error("Report error:", err);
    res.status(500).json({ message: err.message });
  }
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

router.post("/switch-role", verifyToken, (req, res) => {
  const userId = req.user.id;

  UserRole.getCurrentRole(userId, (err, currentRoleRows) => {
    if (err) return res.status(500).json({ message: "DB error" });
    if (!currentRoleRows || currentRoleRows.length === 0)
      return res.status(404).json({ message: "User role not found" });

    const activeRole = currentRoleRows[0].role_name;
    const newRoleName = activeRole === "service" ? "customer" : "service";

    UserRole.getRoleByName(newRoleName, (err, newRoleRows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (!newRoleRows || newRoleRows.length === 0)
        return res.status(404).json({ message: "New role not found" });

      const newRoleId = newRoleRows[0].id;

      UserRole.deactivateCurrentRole(userId, (err) => {
        if (err) return res.status(500).json({ message: "DB error" });

        UserRole.activateRole(userId, newRoleId, (err) => {
          if (err) return res.status(500).json({ message: "DB error" });
          res.json({ role_name: newRoleName });
        });
      });
    });
  });
});



module.exports = router;


