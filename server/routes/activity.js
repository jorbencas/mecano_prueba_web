const express = require('express');
const { authenticate } = require('../auth/middleware');
const { sql } = require('../db');

const router = express.Router();

/**
 * POST /api/activity
 * Save activity log
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { activityType, component, duration, metadata } = req.body;
    const userId = req.user.id;

    // Validation
    if (!activityType || !component || duration === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save to database
    const result = await sql`
      INSERT INTO activity_logs (user_id, activity_type, component, duration, metadata)
      VALUES (${userId}, ${activityType}, ${component}, ${duration}, ${JSON.stringify(metadata || {})})
      RETURNING id, created_at
    `;

    res.json({
      id: result[0].id,
      createdAt: result[0].created_at,
    });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ error: 'Failed to save activity log' });
  }
});

/**
 * GET /api/activity
 * Get activity logs for current user
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 100, offset = 0 } = req.query;

    const logs = await sql`
      SELECT id, activity_type, component, duration, metadata, created_at
      FROM activity_logs
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${parseInt(limit)}
      OFFSET ${parseInt(offset)}
    `;

    res.json({ logs });
  } catch (error) {
    console.error('Get activity logs error:', error);
    res.status(500).json({ error: 'Failed to get activity logs' });
  }
});

/**
 * GET /api/activity/stats
 * Get activity statistics for current user
 */
router.get('/stats', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Total time and activities
    const totals = await sql`
      SELECT 
        COUNT(*) as total_activities,
        SUM(duration) as total_time
      FROM activity_logs
      WHERE user_id = ${userId}
    `;

    // By component
    const byComponent = await sql`
      SELECT 
        component,
        COUNT(*) as count,
        SUM(duration) as time
      FROM activity_logs
      WHERE user_id = ${userId}
      GROUP BY component
    `;

    // Average WPM and accuracy
    const averages = await sql`
      SELECT 
        AVG((metadata->>'wpm')::numeric) as avg_wpm,
        AVG((metadata->>'accuracy')::numeric) as avg_accuracy,
        COUNT(*) FILTER (WHERE (metadata->>'completed')::boolean = true) as total_completed
      FROM activity_logs
      WHERE user_id = ${userId}
        AND metadata->>'wpm' IS NOT NULL
    `;

    res.json({
      totalTime: parseInt(totals[0].total_time) || 0,
      totalActivities: parseInt(totals[0].total_activities) || 0,
      byComponent: byComponent.reduce((acc, row) => {
        acc[row.component] = {
          count: parseInt(row.count),
          time: parseInt(row.time),
        };
        return acc;
      }, {}),
      averageWPM: Math.round(parseFloat(averages[0].avg_wpm) || 0),
      averageAccuracy: Math.round(parseFloat(averages[0].avg_accuracy) || 0),
      totalCompleted: parseInt(averages[0].total_completed) || 0,
    });
  } catch (error) {
    console.error('Get activity stats error:', error);
    res.status(500).json({ error: 'Failed to get activity stats' });
  }
});

module.exports = router;
