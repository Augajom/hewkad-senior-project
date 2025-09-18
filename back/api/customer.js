const express = require('express');
const router = express.Router();
const db = require('../config/db'); // ต้อง import db สำหรับ INSERT
const verifyToken = require('../utils/verifyToken');

const Post = require('../models/customer/Posts');
const History = require('../models/customer/History');
const Kad = require('../models/customer/Kad');

// ===================
// GET KAD options
// ===================
router.get('/kad', async (req, res) => {
  try {
    const kads = await Kad.getAll();
    res.json(kads);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// ===================
// GET all posts
// ===================
router.get('/posts', async (req, res) => {
  try {
    const status = req.query.status || 'Available'; // default = Available
    const posts = await new Promise((resolve, reject) => {
      db.query(
        `SELECT 
          p.id, p.kad_id, k.kad_name, p.store_name, p.product,
          p.service_fee, p.price, p.user_id, p.profile_id,
          u.username, pr.name AS nickname,
          p.delivery, p.delivery_at, p.created_at, pr.picture AS avatar,
          s.status_name
        FROM posts p
        JOIN status s ON p.status_id = s.id
        JOIN users u ON p.user_id = u.id
        JOIN profile pr ON p.profile_id = pr.id
        JOIN kad k ON p.kad_id = k.id
        WHERE s.status_name = ?
        ORDER BY p.created_at DESC`,
        [status],
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
    res.json(posts);
  } catch (err) {
    console.error('Failed to get posts:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


// ===================
// CREATE post
// ===================
router.post('/posts', verifyToken, async (req, res) => {
  try {
    const { kad_id, store_name, product, service_fee, price, status_id, delivery, delivery_at } = req.body;
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

// ===================
// EDIT post
// ===================

router.put('/posts/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // ดึงโพสต์ก่อน
    const existingPost = await Post.getById(postId);
    if (!existingPost) return res.status(404).json({ message: 'Post not found' });

    // ตรวจสอบว่าเป็นเจ้าของโพสต์
    if (existingPost.user_id !== userId) {
      return res.status(403).json({ message: 'You can only edit your own post' });
    }

    const fields = {
      kad_id: req.body.kad_id,
      store_name: req.body.store_name,
      product: req.body.product,
      service_fee: req.body.service_fee,
      price: req.body.price,
      delivery: req.body.delivery,
      delivery_at: req.body.delivery_at,
    };

    const updated = await Post.update(postId, fields);
    if (!updated) return res.status(400).json({ message: 'Nothing to update' });

    const updatedPost = await Post.getById(postId);
    res.json(updatedPost);

  } catch (err) {
    console.error('Update post error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});


// ===================
// DELETE post
// ===================
router.delete('/posts/:postId', verifyToken, async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await Post.getById(postId); // <-- ใช้ getById
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (post.user_id !== userId) return res.status(403).json({ message: 'You can only delete your own post' });

    await Post.delete(postId);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete post' });
  }
});

// ===================
// GET history by status
// ===================
router.get('/history/:status', verifyToken, async (req, res) => {
  try {
    const status = req.params.status;
    const userId = req.user.id;

    const posts = await History.getByStatus(status, userId);
    res.json(posts);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch history' });
  }
});

module.exports = router;
