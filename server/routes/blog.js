const express = require('express');
const { BlogPost, User } = require('../models/db');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const category = req.query.category || 'all';
    const limit = 10;
    const skip = (page - 1) * limit;

    let query = {};
    if (category !== 'all') query.category = category;

    const posts = await BlogPost.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name')
      .lean();

    const total = await BlogPost.countDocuments(query);

    res.json({
      posts,
      pagination: {
        page,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Blog fetch error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/posts/:id', async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id)
      .populate('userId', 'name')
      .populate('likes', 'name')
      .populate('comments.userId', 'name');

    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts', authenticateToken, async (req, res) => {
  try {
    const { title, content, category, image } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content required' });
    }

    const user = await User.findById(req.user.id);
    const post = await BlogPost.create({
      userId: req.user.id,
      userName: user.name,
      title,
      content,
      category: category || 'general',
      image: image || null,
      likes: [],
      comments: []
    });

    res.status(201).json({ post });
  } catch (err) {
    console.error('Post creation error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { title, content, category, image } = req.body;
    post.title = title || post.title;
    post.content = content || post.content;
    post.category = category || post.category;
    post.image = image !== undefined ? image : post.image;
    post.updatedAt = new Date();

    await post.save();
    res.json({ post });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);

    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await BlogPost.findByIdAndDelete(req.params.id);
    res.json({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts/:id/like', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const hasLiked = post.likes.includes(req.user.id);

    if (hasLiked) {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();
    res.json({ post, liked: !hasLiked });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/posts/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: 'Comment required' });

    const post = await BlogPost.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const user = await User.findById(req.user.id);
    const comment = {
      userId: req.user.id,
      userName: user.name,
      content,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();

    res.status(201).json({ comment: post.comments[post.comments.length - 1] });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/posts/:postId/comments/:commentId', authenticateToken, async (req, res) => {
  try {
    const post = await BlogPost.findById(req.params.postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comment = post.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    post.comments.id(req.params.commentId).deleteOne();
    await post.save();

    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/user/:userId/posts', async (req, res) => {
  try {
    const posts = await BlogPost.find({ userId: req.params.userId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name');

    res.json({ posts });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
