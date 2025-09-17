const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const Post = require('../models/customer/Posts');
const Kad = require('../models/customer/Kad');
const History = require('../models/customer/History');
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

// routes/home.js
router.post('/create', verifyToken, async (req, res) => {
  try {
    const {
      kad_id, store_name, product,
      service_fee, price, status_id,
      delivery, delivery_at
    } = req.body;

    // ดึง user_id และ profile_id จาก JWT
    const user_id = req.user.id;
    const profile_id = req.user.profile_id;

    if (!user_id || !profile_id) {
      return res.status(400).json({ message: 'User not authenticated properly' });
    }

    db.query(
      `INSERT INTO posts 
        (kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at],
      (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        res.json({
          id: result.insertId,
          kad_id, store_name, product, service_fee, price, user_id, profile_id, status_id, delivery, delivery_at
        });
      }
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// แก้ไขโพสต์
router.put('/edit/:postId', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own post' });
    }

    const updatedPost = await Post.update(postId, req.body);
    res.json(updatedPost);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update post' });
  }
});

// ลบโพสต์
router.delete('/delete/:postId', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (post.user_id !== userId) {
      return res.status(403).json({ message: 'You can only delete your own post' });
    }

    await Post.delete(postId);
    res.json({ message: 'Post deleted' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
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
