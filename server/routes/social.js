const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const jwt = require('jsonwebtoken');

// Middleware to authenticate token
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Follow a user
router.post('/follow/:id', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await sql`
      INSERT INTO followers (follower_id, following_id)
      VALUES (${followerId}, ${followingId})
      ON CONFLICT DO NOTHING
    `;

    res.json({ message: 'Followed successfully' });
  } catch (error) {
    console.error('Follow error:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

// Unfollow a user
router.delete('/follow/:id', authenticate, async (req, res) => {
  try {
    const followerId = req.user.id;
    const followingId = req.params.id;

    await sql`
      DELETE FROM followers
      WHERE follower_id = ${followerId} AND following_id = ${followingId}
    `;

    res.json({ message: 'Unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow error:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

// Get public profile
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const viewerId = req.headers['authorization'] 
      ? jwt.decode(req.headers['authorization'].split(' ')[1])?.id 
      : null;

    // Get user info
    const userResult = await sql`
      SELECT id, display_name, photo_url, created_at, role
      FROM users
      WHERE id = ${userId}
    `;

    if (userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = userResult[0];

    // Get stats summary
    const statsResult = await sql`
      SELECT 
        AVG(wpm) as avg_wpm,
        MAX(wpm) as max_wpm,
        COUNT(*) as total_sessions
      FROM practice_stats
      WHERE user_id = ${userId}
    `;

    // Get follower counts
    const followersCount = await sql`
      SELECT COUNT(*) as count FROM followers WHERE following_id = ${userId}
    `;

    const followingCount = await sql`
      SELECT COUNT(*) as count FROM followers WHERE follower_id = ${userId}
    `;

    // Check if viewer is following
    let isFollowing = false;
    if (viewerId) {
      const followCheck = await sql`
        SELECT 1 FROM followers 
        WHERE follower_id = ${viewerId} AND following_id = ${userId}
      `;
      isFollowing = followCheck.length > 0;
    }

    res.json({
      user,
      stats: statsResult[0],
      social: {
        followers: parseInt(followersCount[0].count),
        following: parseInt(followingCount[0].count),
        isFollowing
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Create a post
router.post('/posts', authenticate, async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.id;

    const result = await sql`
      INSERT INTO posts (user_id, title, content, category)
      VALUES (${userId}, ${title}, ${content}, ${category || 'general'})
      RETURNING *
    `;

    res.json(result[0]);
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
});

// Get posts
router.get('/posts', async (req, res) => {
  try {
    const { category, limit = 20, offset = 0 } = req.query;

    let posts;
    if (category && category !== 'all') {
      posts = await sql`
        SELECT p.*, u.display_name, u.photo_url,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.category = ${category}
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      posts = await sql`
        SELECT p.*, u.display_name, u.photo_url,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comment_count
        FROM posts p
        JOIN users u ON p.user_id = u.id
        ORDER BY p.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    res.json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// Like a post
router.post('/posts/:id/like', authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user.id;

    // Check if already liked
    const existing = await sql`
      SELECT 1 FROM post_likes WHERE post_id = ${postId} AND user_id = ${userId}
    `;

    if (existing.length > 0) {
      // Unlike
      await sql`DELETE FROM post_likes WHERE post_id = ${postId} AND user_id = ${userId}`;
      await sql`UPDATE posts SET likes = likes - 1 WHERE id = ${postId}`;
      res.json({ liked: false });
    } else {
      // Like
      await sql`INSERT INTO post_likes (post_id, user_id) VALUES (${postId}, ${userId})`;
      await sql`UPDATE posts SET likes = likes + 1 WHERE id = ${postId}`;
      res.json({ liked: true });
    }
  } catch (error) {
    console.error('Like error:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

module.exports = router;
