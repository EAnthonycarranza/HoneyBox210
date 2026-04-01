const express = require('express');
const BlogPost = require('../models/BlogPost');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/blog - List published blog posts (public)
router.get('/', async (req, res) => {
  try {
    const posts = await BlogPost.find({ published: true }).sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    console.error('List blog posts error:', error.message);
    res.status(500).json({ message: 'Server error fetching blog posts.' });
  }
});

// GET /api/blog/all - List all blog posts (admin)
router.get('/all', adminAuth, async (req, res) => {
  try {
    const posts = await BlogPost.find().sort({ createdAt: -1 });
    res.json({ posts });
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching blog posts.' });
  }
});

// GET /api/blog/:id - Get single blog post
router.get('/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ post });
  } catch (error) {
    if (error.kind === 'ObjectId') return res.status(404).json({ message: 'Post not found.' });
    res.status(500).json({ message: 'Server error.' });
  }
});

// POST /api/blog - Create blog post (admin)
router.post('/', adminAuth, async (req, res) => {
  try {
    const { title, content, excerpt, image, published } = req.body;
    const post = new BlogPost({ title, content, excerpt, image, published });
    await post.save();
    res.status(201).json({ message: 'Blog post created.', post });
  } catch (error) {
    console.error('Create blog post error:', error.message);
    res.status(500).json({ message: 'Server error creating blog post.' });
  }
});

// PUT /api/blog/:id - Update blog post (admin)
router.put('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ message: 'Blog post updated.', post });
  } catch (error) {
    res.status(500).json({ message: 'Server error updating blog post.' });
  }
});

// DELETE /api/blog/:id - Delete blog post (admin)
router.delete('/:id', adminAuth, async (req, res) => {
  try {
    const post = await BlogPost.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found.' });
    res.json({ message: 'Blog post deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error deleting blog post.' });
  }
});

module.exports = router;
