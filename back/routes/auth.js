// routes/auth.js
const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const db = require('../config/db');

const router = express.Router();

function sign(res, payload) {
  const token = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, { expiresIn: '1d' });
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: 24 * 60 * 60 * 1000
  });
  return token;
}

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: process.env.FRONTEND_URL, session: false }),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // ensure profile row exists
      const [existsRows] = await db.promise().query(
        'SELECT id FROM profile WHERE user_id = ? LIMIT 1',
        [userId]
      );
      if (!existsRows.length) {
        await db.promise().query(
          `INSERT INTO profile (user_id, email, name, picture)
           VALUES (?, ?, ?, ?)`,
          [
            userId,
            req.user.email || null,
            req.user.fullName || null,
            (req.user.picture || '').split('?')[0] || null
          ]
        );
      }

      const roles = await User.getRoles(userId);
      const [prow] = await db.promise().query(
        'SELECT picture, identity_file FROM profile WHERE user_id = ? LIMIT 1',
        [userId]
      );
      const p = prow?.[0] || {};
      const picture = (p.picture || req.user.picture || '').split('?')[0] || null;

      sign(res, {
        id: userId,
        roles,
        fullName: req.user.fullName || null,
        email: req.user.email || null,
        picture
      });

    res.redirect(`${process.env.FRONTEND_URL}/user/home`);
  } catch (err) {
      console.error('Google callback error:', err);
      res.redirect(`${process.env.FRONTEND_URL}?error=auth_failed`);
    }
  }
);

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = await User.login(email, password);
    const roles = await User.getRoles(user.id);

    const [prow] = await db.promise().query(
      'SELECT picture FROM profile WHERE user_id = ? LIMIT 1',
      [user.id]
    );
    const dbPic = (prow?.[0]?.picture || '').trim();
    const picture = (dbPic || user.picture || '').split('?')[0] || null;

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
      picture: decoded.picture, 
      profile_id: profile.profile_id || null,
      identityFile: profile.identity_file || null 
    });
  } catch (err) {
    console.error('auth/me error:', err);
    res.status(401).json({ error: 'invalid_token' });
  }
});

router.get("/check", (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    res.json({ valid: true, user: decoded });
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

module.exports = router;
