const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// models
const User = require('../models/userModel');
const Payment = require('../models/admin/Payment');
const historyadmin = require('../models/admin/historyadmin');
const Report = require("../models/admin/Report");
const manageUser = require('../models/admin/manageUser');
const getPost = require('../models/admin/getPost');
const Orderingnoti = require("../models/customer/Orderingnoti");
const { sendReportResolvedEmail } = require('../utils/NotiReportEmail');


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

// Reject Payment
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

// Approve Payment
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

// Multer setup for file uploads
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const getKad = require('../models/admin/getKad');
const Dashboard = require('../models/admin/Dashboard');
const DailySummary = require('../models/admin/DailySummary');

// 💡 แก้ encoding ของชื่อไฟล์
Buffer.prototype.toString = (function (original) {
  return function (...args) {
    if (this instanceof Buffer && args[0] === "latin1") {
      return original.call(this, "utf8");
    }
    return original.apply(this, args);
  };
})(Buffer.prototype.toString);

// 🧩 สร้างโฟลเดอร์ /Files/Payment ถ้ายังไม่มี
const uploadDir = path.join(__dirname, "../Files/Payment");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 🎯 กำหนด storage สำหรับ multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // ✅ แปลงชื่อไฟล์จาก latin1 → utf8
    let originalName = Buffer.from(file.originalname, "latin1").toString("utf8");

    // 💡 ป้องกันอักขระพิเศษหรือช่องว่างในชื่อไฟล์
    originalName = originalName.replace(/[<>:"/\\|?*\s]/g, "_");

    cb(null, originalName);
  },
});

// ✅ ตรวจสอบชนิดไฟล์และขนาด (อนุญาตเฉพาะภาพ)
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error("Invalid file type. Only image files allowed."), false);
  }
  cb(null, true);
};

// ✅ ตั้งค่า multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

// 📤 Upload endpoint
router.post("/upload/:orderId", upload.single("file"), async (req, res) => {
  try {
    const orderId = req.params.orderId;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filename = req.file.filename;

    // บันทึกลง DB
    await Payment.updateSlipFilename(orderId, filename);

    res.json({
      success: true,
      message: "Slip uploaded successfully",
      file: filename,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ success: false, message: "Slip upload failed" });
  }
});

//history admin
router.get("/history", async (req, res) => {
  try {
    const orders = await historyadmin.getAllHistory();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    console.error("❌ Error fetching history:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

router.get("/report", async (req, res) => {
  try {
    const reports = await historyadmin.getReportedHistory();
    res.json({ reports }); // ✅ เปลี่ยนจาก orders → reports
  } catch (error) {
    console.error("Error fetching reported history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


const resolvedDir = path.join(__dirname, "../Files/Resolved");
if (!fs.existsSync(resolvedDir)) {
  fs.mkdirSync(resolvedDir, { recursive: true });
}

const resolvedStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, resolvedDir),
  filename: (req, file, cb) => {
    const safeName =
      Date.now() + "_" + file.originalname.replace(/[<>:"/\\|?*\s]/g, "_");
    cb(null, safeName);
  },
});
const resolvedUpload = multer({ storage: resolvedStorage });

router.put(
  "/report/:orderId/resolve",
  resolvedUpload.single("file"),
  async (req, res) => {
    const { orderId } = req.params;
    const { resolved_detail } = req.body;
    const filePath = req.file ? `/Files/Resolved/${req.file.filename}` : null;

    try {
      // 1️⃣ อัปเดต report + status ของ order และ post เป็น 9
      await Report.resolveReport(orderId, resolved_detail, filePath, "Reported");

      // 2️⃣ ดึงข้อมูล owner ของ post เพื่อนำไปส่ง email
      const postId = await Orderingnoti.getPostIdByOrderId(orderId);
      const owner = await Orderingnoti.getOwnerEmailByPostId(postId);

      // 3️⃣ ส่ง email แจ้งลูกค้า
      sendReportResolvedEmail(
        owner.email,
        owner.nickname,
        owner.product,
        owner.store_name
      );

      res.json({ message: "Report resolved and email sent successfully" });
    } catch (err) {
      console.error("❌ Error resolving report:", err);
      res.status(500).json({ error: "Failed to update report" });
    }
  }
);

router.get("/users", async (req, res) => {
  try {
    const users = await manageUser.getAllInfo();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/users/work-permit/:id", async (req, res) => {
  const userId = req.params.id;
  const { isActive } = req.body;

  try {
    const result = await manageUser.toggleWorkPermit(userId, isActive ? 1 : 0);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to toggle work permit" });
  }
});

router.delete("/users/delete/:id", async (req, res) => {
  const userId = req.params.id;

  try {
    const result = await manageUser.deleteUser(userId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    console.error("❌ Error deleting user:", error);
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
});

router.get("/users/request", async (req, res) => {
  try {
    const users = await manageUser.getRequest();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.put("/users/request/update/:id", async (req, res) => {
  const userId = req.params.id;
  const { isActive } = req.body;

  try {
    const result = await manageUser.updateRequestActive(userId, isActive);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update isActive" });
  }
});

router.get('/posts', async (req, res) => {
  try {
    // เรียกจาก model
    const postsList = await getPost.getAll();

    res.json(postsList);
  } catch (err) {
    console.error('Failed to get posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get("/kad", async (req, res) => {
  try {
    const kadList = await getKad.getAll();
    res.json(kadList);
  } catch (err) {
    console.error("Failed to get kad list:", err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/dashboard-stats", async (req, res) => {
  try {
    const { kad_id, start, end } = req.query;
    const data = await Dashboard.getStats(kad_id, start, end);
    res.json({ success: true, data });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/daily-summary", async (req, res) => {
  try {
    const days = parseInt(req.query.days || 10);
    const data = await DailySummary.getSummary(days);
    res.json(data);
  } catch (error) {
    console.error("Error fetching daily summary:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
