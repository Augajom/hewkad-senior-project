const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// models
const User = require('../models/userModel');

router.get('/', (req, res) => {
  res.json({ message: 'Admin route working' });
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // ตรวจสอบ password ผ่าน userModel
    const match = await User.comparePassword(user.id, password); // สมมติ User.comparePassword มีอยู่
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // สร้าง JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1d' }
    );

    // เก็บ cookie httpOnly
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax', // หรือ 'strict'
      maxAge: 24 * 60 * 60 * 1000 // 1 วัน
    });

    res.json({ message: 'Login success', user: { id: user.id, username: user.username } });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
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

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', path: '/' });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
