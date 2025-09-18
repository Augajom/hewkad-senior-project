const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db'); // ใช้ query เพื่อดึง profile_id
require('dotenv').config();

// เริ่ม login
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

// callback หลัง login สำเร็จ
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${process.env.FRONTEND_URL}`, session: false }),
  async (req, res) => {
    try {
      const user = req.user;

      // ดึง roles จาก DB
      const roles = await User.getRoles(user.id, true);

      // ดึง profile_id จากตาราง profile
      const profileRow = await new Promise((resolve, reject) => {
        db.query('SELECT id FROM profile WHERE user_id = ? LIMIT 1', [user.id], (err, results) => {
          if (err) return reject(err);
          resolve(results[0] || null);
        });
      });

      if (!profileRow) {
        console.error('Profile not found for user', user.id);
        return res.redirect(`${process.env.FRONTEND_URL}?error=no_profile`);
      }

      const profile_id = profileRow.id;

      // สร้าง JWT
      const token = jwt.sign(
        { id: user.id, profile_id, roles },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: '1d' }
      );

      // ส่ง cookie ให้ browser
      res.cookie('token', token, {
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000,
        path: '/',
      });

      // redirect ไปหน้า Home
      res.redirect(`${process.env.FRONTEND_URL}/home`);
    } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=login_failed`);
    }
  }
);



module.exports = router;
