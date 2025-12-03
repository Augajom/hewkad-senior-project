const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: 'Username and password required' });

  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await User.comparePassword(user.password, password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // 🔹 ดึง roles ของ user
    const roles = await User.getRoles(user.id); // ['admin', 'customer', ...]

    // สร้าง token พร้อม role
    const token = jwt.sign(
      { id: user.id, username: user.username, roles },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 24 * 60 * 60 * 1000,
    });

    res.json({
      message: 'Login success',
      user: { id: user.id, username: user.username, roles }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
