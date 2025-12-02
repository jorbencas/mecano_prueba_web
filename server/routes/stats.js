const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../auth/middleware');

const router = express.Router();

/**
 * POST /api/stats
 * Save practice session statistics
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { mode, level_number, wpm, accuracy, errors, duration, completed, metadata } = req.body;
    const userId = req.user.id;

    // Validation
    if (!mode || wpm === undefined || accuracy === undefined || duration === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save statistics
    const result = await sql`
      INSERT INTO practice_stats (user_id, mode, level_number, wpm, accuracy, errors, duration, completed, metadata)
      VALUES (${userId}, ${mode}, ${level_number}, ${wpm}, ${accuracy}, ${errors || 0}, ${duration}, ${completed || false}, ${JSON.stringify(metadata || {})})
      RETURNING *
    `;

    res.json({ stat: result[0] });
  } catch (error) {
    console.error('Save stats error:', error);
    res.status(500).json({ error: 'Failed to save statistics' });
  }
});

/**
 * GET /api/stats/leaderboard
 * Get global leaderboard
 */
router.get('/leaderboard', authenticate, async (req, res) => {
  try {
    const { mode = 'all', limit = 10 } = req.query;

    let query;
    if (mode === 'all') {
      query = sql`
        SELECT 
          u.id, 
          u.display_name, 
          u.photo_url,
          MAX(ps.wpm) as max_wpm,
          AVG(ps.accuracy) as avg_accuracy,
          COUNT(ps.id) as total_games
        FROM users u
        JOIN practice_stats ps ON u.id = ps.user_id
        GROUP BY u.id, u.display_name, u.photo_url
        ORDER BY max_wpm DESC
        LIMIT ${limit}
      `;
    } else {
      query = sql`
        SELECT 
          u.id, 
          u.display_name, 
          u.photo_url,
          MAX(ps.wpm) as max_wpm,
          AVG(ps.accuracy) as avg_accuracy,
          COUNT(ps.id) as total_games
        FROM users u
        JOIN practice_stats ps ON u.id = ps.user_id
        WHERE ps.mode = ${mode}
        GROUP BY u.id, u.display_name, u.photo_url
        ORDER BY max_wpm DESC
        LIMIT ${limit}
      `;
    }

    const leaderboard = await query;
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * GET /api/stats/:userId
 * Get comprehensive user statistics
 */
router.get('/:userId', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to view their own stats or admins to view any
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Get overall statistics
    const overallStats = await sql`
      SELECT 
        COUNT(*) as total_sessions,
        AVG(wpm) as avg_wpm,
        MAX(wpm) as max_wpm,
        AVG(accuracy) as avg_accuracy,
        SUM(duration) as total_time,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_sessions
      FROM practice_stats
      WHERE user_id = ${userId}
    `;

    // Get statistics by mode
    const statsByMode = await sql`
      SELECT 
        mode,
        COUNT(*) as sessions,
        AVG(wpm) as avg_wpm,
        MAX(wpm) as max_wpm,
        AVG(accuracy) as avg_accuracy,
        SUM(duration) as total_time
      FROM practice_stats
      WHERE user_id = ${userId}
      GROUP BY mode
      ORDER BY total_time DESC
    `;

    // Get recent sessions
    const recentSessions = await sql`
      SELECT *
      FROM practice_stats
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 20
    `;

    // Get WPM progression over time
    const wpmProgression = await sql`
      SELECT 
        DATE(created_at) as date,
        AVG(wpm) as avg_wpm,
        MAX(wpm) as max_wpm
      FROM practice_stats
      WHERE user_id = ${userId}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

    res.json({
      overall: overallStats[0],
      byMode: statsByMode,
      recent: recentSessions,
      wpmProgression: wpmProgression
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

/**
 * GET /api/stats/:userId/progress
 * Get level progress across all modes
 */
router.get('/:userId/progress', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to view their own progress or admins to view any
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await sql`
      SELECT *
      FROM level_progress
      WHERE user_id = ${userId}
      ORDER BY mode, level_number
    `;

    res.json({ progress });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

module.exports = router;
