const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const Post = require('../models/customer/Posts');
const Kad = require('../models/customer/Kad');
const History = require('../models/customer/History');

// ✅ เพิ่มบรรทัดนี้
const verifyToken = require('../utils/verifyToken');
const requireRole = require('../utils/requireRole');
// GET kad options
router.get('/kad', async (req, res) => {
  try {
    console.log('Fetching KAD from DB...');
    const kads = await Kad.getAll();
    console.log('KAD:', kads);
    res.json(kads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.getAll();
    res.json(posts); // ต้องส่งกลับ
  } catch (err) {
    console.error('Failed to get posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



// CREATE post
router.post('/create', async (req, res) => {
  try {
    const post = await Post.create(
      req.body.kad_id,
      req.body.store_name,
      req.body.product,
      req.body.service_fee,
      req.body.price,
      req.body.user_id,
      req.body.profile_id,
      req.body.status_id,
      req.body.delivery,
      req.body.delivery_at
    );
    res.status(201).json(post);
  } catch (err) {
    console.error('Create post failed:', err);
    res.status(500).json({ message: err.message });
  }
});

// UPDATE post
router.put('/edit/:id', async (req, res) => {
  try {
    const success = await Post.update(req.params.id, req.body);
    if (!success) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post updated successfully' });
  } catch (err) {
    console.error('Update post failed:', err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE post
router.delete('/delete/:id', async (req, res) => {
  try {
    const success = await Post.delete(req.params.id);
    if (!success) return res.status(404).json({ message: 'Post not found' });
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    console.error('Delete post failed:', err);
    res.status(500).json({ message: err.message });
  }
});
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


module.exports = router;
