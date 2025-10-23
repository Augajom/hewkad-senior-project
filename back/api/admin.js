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

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
