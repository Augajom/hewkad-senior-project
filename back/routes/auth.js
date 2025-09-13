const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
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
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax', maxAge: 86400000 });
    res.redirect(`${process.env.FRONTEND_URL}/home`);
  }
);


module.exports = router;
