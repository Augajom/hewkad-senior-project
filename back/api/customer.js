const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const Post = require('../models/Posts');
const Kad = require('../models/Kad');


router.get('/', (req, res) => {
  res.json({ message: 'Customer route working' });
});

// GET all posts
router.get('/posts', async (req, res) => {
  try {
    const posts = await Post.getAll();
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET kad options
router.get('/kad', async (req, res) => {
  try {
    const kads = await Kad.getAll();
    res.json(kads);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;