const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Post = require('../models/customer/Posts');
const Kad = require('../models/customer/Kad');
const History = require('../models/customer/History');

// ✅ เพิ่มบรรทัดนี้
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
router.get('/:status', async (req, res) => {
  const status = req.params.status;
  const userId = req.query.userId || null;  // ส่ง userId ผ่าน query string เช่น ?userId=1

  try {
    const posts = await History.getByStatus(status, userId);
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

// GET all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await post.getAll();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

// GET kad options
router.get('/kad', async (req, res) => {
  try {
    // สมมติมี model kad
    const kads = await kad.getAll();
    res.json(kads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch kads' });
  }
});

// POST create
router.post('/create', async (req, res) => {
  try {
    const newPost = await post.create(
      req.body.kad_id,
      req.body.store_name,
      req.body.product,
      req.body.service_fee,
      req.body.price,
      req.user.id,
      req.user.profileId,
      req.body.status_id,
      req.body.delivery,
      req.body.delivery_at
    );
    res.json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create post' });
  }
});

// PUT update
router.put('/edit/:id', async (req, res) => {
  try {
    const updated = await post.update(req.params.id, req.body);
    res.json({ success: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// DELETE
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await post.delete(req.params.id);
    res.json({ success: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});


module.exports = router;
