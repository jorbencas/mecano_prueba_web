const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../auth/middleware');

const router = express.Router();

/**
 * POST /api/multiplayer/rooms
 * Create a new multiplayer room
 */
router.post('/rooms', authenticate, async (req, res) => {
  try {
    const { name, mode, maxPlayers, isPrivate } = req.body;
    const creatorId = req.user.id;

    const result = await sql`
      INSERT INTO multiplayer_rooms (creator_id, name, mode, max_players, is_private)
      VALUES (${creatorId}, ${name}, ${mode}, ${maxPlayers || 4}, ${isPrivate || false})
      RETURNING *
    `;

    res.json({ room: result[0] });
  } catch (error) {
    console.error('Create room error:', error);
    res.status(500).json({ error: 'Failed to create room' });
  }
});

/**
 * GET /api/multiplayer/rooms
 * Get list of active public rooms
 */
router.get('/rooms', authenticate, async (req, res) => {
  try {
    const rooms = await sql`
      SELECT r.*, u.email as creator_email, u.display_name as creator_name
      FROM multiplayer_rooms r
      JOIN users u ON r.creator_id = u.id
      WHERE r.is_private = false AND r.status = 'waiting'
      ORDER BY r.created_at DESC
      LIMIT 50
    `;

    res.json({ rooms });
  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json({ error: 'Failed to get rooms' });
  }
});

/**
 * POST /api/multiplayer/friends/request
 * Send friend request
 */
router.post('/friends/request', authenticate, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    const userId = req.user.id;

    // Check if already friends or request exists
    const existing = await sql`
      SELECT * FROM friendships
      WHERE (user_id = ${userId} AND friend_id = ${targetUserId})
         OR (user_id = ${targetUserId} AND friend_id = ${userId})
    `;

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Friend request already exists or already friends' });
    }

    const result = await sql`
      INSERT INTO friendships (user_id, friend_id, status)
      VALUES (${userId}, ${targetUserId}, 'pending')
      RETURNING *
    `;

    res.json({ friendship: result[0] });
  } catch (error) {
    console.error('Friend request error:', error);
    res.status(500).json({ error: 'Failed to send friend request' });
  }
});

/**
 * POST /api/multiplayer/friends/accept
 * Accept friend request
 */
router.post('/friends/accept', authenticate, async (req, res) => {
  try {
    const { friendshipId } = req.body;
    const userId = req.user.id;

    const result = await sql`
      UPDATE friendships
      SET status = 'accepted', accepted_at = NOW()
      WHERE id = ${friendshipId} AND friend_id = ${userId}
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    res.json({ friendship: result[0] });
  } catch (error) {
    console.error('Accept friend error:', error);
    res.status(500).json({ error: 'Failed to accept friend request' });
  }
});

/**
 * GET /api/multiplayer/friends
 * Get user's friends list
 */
router.get('/friends', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const friends = await sql`
      SELECT 
        f.*,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.email
          ELSE u1.email
        END as friend_email,
        CASE 
          WHEN f.user_id = ${userId} THEN u2.display_name
          ELSE u1.display_name
        END as friend_name,
        CASE 
          WHEN f.user_id = ${userId} THEN f.friend_id
          ELSE f.user_id
        END as friend_id
      FROM friendships f
      JOIN users u1 ON f.user_id = u1.id
      JOIN users u2 ON f.friend_id = u2.id
      WHERE (f.user_id = ${userId} OR f.friend_id = ${userId})
        AND f.status = 'accepted'
    `;

    res.json({ friends });
  } catch (error) {
    console.error('Get friends error:', error);
    res.status(500).json({ error: 'Failed to get friends' });
  }
});

/**
 * GET /api/multiplayer/match-history
 * Get user's match history
 */
router.get('/match-history', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    const matches = await sql`
      SELECT *
      FROM match_history
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    res.json({ matches });
  } catch (error) {
    console.error('Get match history error:', error);
    res.status(500).json({ error: 'Failed to get match history' });
  }
});

module.exports = router;
