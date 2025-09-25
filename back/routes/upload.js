const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const verifyToken = require('../utils/verifyToken');

const router = express.Router();

// สร้างโฟลเดอร์ถ้ายังไม่มี
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    const safeExt = ['.png', '.jpg', '.jpeg', '.webp', '.gif'].includes(ext) ? ext : '.png';
    const name = `u${req.user?.id || 'x'}_${Date.now()}${safeExt}`;
    cb(null, name);
  }
});
const fileFilter = (_req, file, cb) => {
  if (/^image\/(png|jpe?g|webp|gif)$/i.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 8 * 1024 * 1024 } }); // 8MB

router.post('/avatar', verifyToken, upload.single('file'), (req, res) => {
  const filename = req.file.filename;
  // เสิร์ฟไฟล์ผ่าน static /uploads
  const url = `/uploads/${filename}`;
  res.json({ ok: true, url });
});

module.exports = router;
