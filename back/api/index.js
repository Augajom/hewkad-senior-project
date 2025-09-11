const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// models
const User = require('../models/userModel');

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: 'Username and password required' });

  try {
    const user = await User.findByUsername(username);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // generate JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: '1h' }
    );

    // เก็บ session
    req.session.user = { id: user.id, username: user.username };

    res.json({
      message: 'Login success',
      token,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Register
router.post('/register', async (req, res) => {
  const { username, password, email, name, phone_num, bank, acc_number, acc_owner } = req.body;

  if (!username || !password || !email || !name || !phone_num || !bank || !acc_number || !acc_owner) {
    return res.status(400).json({ message: 'All fields required' });
  }

  try {
    const newUser = await User.create(username, password, email, name, phone_num, bank, acc_number, acc_owner);
    res.json({ message: 'User created successfully', user: newUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.json({ message: 'Logged out successfully' });
  });
});

module.exports = router;
