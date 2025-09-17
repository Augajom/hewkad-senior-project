const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const verifyToken = require('../utils/verifyToken');
require('dotenv').config();


// เริ่ม login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// callback หลังจาก login success
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}`, session: false }),
  async (req, res) => {   // <- ใส่ async ตรงนี้
    const user = req.user;

    // ดึง roles จาก DB
    const roles = await User.getRoles(user.id, true);

    // สร้าง JWT
    const token = jwt.sign(
      { id: user.id, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );

    // เก็บ cookie แล้ว redirect
    res.cookie('token', token, {
      domain: 'localhost',      // *** ต้องเป็น 'localhost' ***
      httpOnly: true,
      sameSite: 'lax',          // หรือ 'none' ถ้าใช้ https
      maxAge: 86400000,         // อายุ 1 วัน
      path: '/',                // path root
    });
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);

router.get('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.getById(userId); // ต้องมี method getById
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to get user' });
  }
});


module.exports = router;
