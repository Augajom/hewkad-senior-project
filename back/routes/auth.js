const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const User = require('../models/userModel');
const db = require('../config/db');

const router = express.Router();

// --- ฟังก์ชันดาวน์โหลดและบันทึกรูป avatar จาก Google ---

async function saveGooglePicture(url, userId) {
  if (!url) return null;
  const response = await axios.get(url.split('?')[0], { responseType: 'arraybuffer' });
  const uploadDir = path.join(__dirname, '../public/uploads/avatars');
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const filePath = path.join(uploadDir, `${userId}.jpg`);
  fs.writeFileSync(filePath, response.data);

  return `/uploads/avatars/${userId}.jpg`; // path ที่เก็บใน DB
}



// --- สร้าง JWT และ set cookie ---
function sign(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 24 * 60 * 60 * 1000,
  });
  return token;
}

// --- Google OAuth ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

// --- Google OAuth callback ---
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL, session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const conn = db.promise();

      // --- ตรวจสอบ profile ใน DB ---
      const [existing] = await conn.query(
        'SELECT id, picture FROM profile WHERE user_id = ? LIMIT 1',
        [userId]
      );

      let localPic = null;

      if (!existing.length) {
        // ไม่มี profile → ดาวน์โหลดรูปจาก Google
        if (req.user.picture) {
          try {
            localPic = await saveGooglePicture(req.user.picture, userId);
            console.log('[Google OAuth] Local picture path:', localPic);
          } catch (err) {
            console.error('[Google OAuth] Failed to download Google picture:', err);
            localPic = null;
          }
        }

        // สร้าง profile ใหม่ พร้อม path local
        await conn.query(
          `INSERT INTO profile (user_id, email, name, picture)
           VALUES (?, ?, ?, ?)`,
          [userId, req.user.email || null, req.user.fullName || null, localPic]
        );
        console.log('[Google OAuth] Created new profile with local picture:', localPic);
      } else {
        // มี profile อยู่แล้ว → ใช้ picture เดิม
        localPic = existing[0].picture || null;
        console.log('[Google OAuth] Profile already has picture, keeping existing:', localPic);
      }

      // --- ดึง roles ของ user ---
      const roles = await User.getRoles(userId);

      // --- สร้าง JWT และเซ็ต cookie ---
      sign(res, {
        id: userId,
        roles,
        fullName: req.user.fullName || null,
        email: req.user.email || null,
        picture: localPic
      });

      res.redirect(`${process.env.FRONTEND_URL}/user/home`);
    } catch (err) {
      console.error('[Google OAuth] Callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
  }
);



// --- Login ปกติ ---
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.login(email, password);
    const roles = await User.getRoles(user.id);

    const [prow] = await db.promise().query(
      'SELECT picture FROM profile WHERE user_id = ? LIMIT 1',
      [user.id]
    );

    // ใช้ path ของไฟล์ local จาก profile ถ้ามี
    const picture = prow?.[0]?.picture || null;

    sign(res, {
      id: user.id,
      roles,
      fullName: user.name || user.fullName || null,
      email: user.email || null,
      picture
    });

    res.json({ ok: true });
  } catch (e) {
    console.error('POST /login error:', e);
    res.status(401).json({ error: 'invalid_credentials' });
  }
});

// --- ดึงข้อมูลผู้ใช้จาก token ---
router.get('/me', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (!token) return res.status(401).json({ error: 'no_token' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const [profileRows] = await db.promise().query(
      'SELECT id AS profile_id, picture, identity_file FROM profile WHERE user_id = ? LIMIT 1',
      [decoded.id]
    );
    const profile = profileRows?.[0] || {};

    res.json({
      id: decoded.id,
      fullName: decoded.fullName,
      email: decoded.email,
      roles: decoded.roles,
      picture: profile.picture || decoded.picture || null,
      profile_id: profile.profile_id || null,
      identityFile: profile.identity_file || null
    });
  } catch (err) {
    console.error('auth/me error:', err);
    res.status(401).json({ error: 'invalid_token' });
  }
});

// --- ตรวจสอบ token ---
router.get('/check', (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// --- Logout ---
router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
