const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../auth/middleware');

const router = express.Router();

/**
 * GET /api/progress/:userId/:mode
 * Get level progress for a specific mode
 */
router.get('/:userId/:mode', authenticate, async (req, res) => {
  try {
    const { userId, mode } = req.params;

    // Only allow users to view their own progress or admins to view any
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await sql`
      SELECT *
      FROM level_progress
      WHERE user_id = ${userId} AND mode = ${mode}
      ORDER BY level_number
    `;

    res.json({ progress });
  } catch (error) {
    console.error('Get mode progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

/**
 * POST /api/progress
 * Update level completion and unlock next level
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const { mode, level_number, wpm, accuracy, completed } = req.body;
    const userId = req.user.id;

    // Validation
    if (!mode || level_number === undefined || wpm === undefined || accuracy === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate stars based on performance (simple algorithm)
    let stars = 0;
    if (accuracy >= 95 && wpm >= 60) stars = 3;
    else if (accuracy >= 90 && wpm >= 40) stars = 2;
    else if (accuracy >= 80 && wpm >= 20) stars = 1;

    // Check if progress record exists
    const existing = await sql`
      SELECT * FROM level_progress
      WHERE user_id = ${userId} AND mode = ${mode} AND level_number = ${level_number}
    `;

    let result;
    if (existing.length > 0) {
      // Update existing record if new performance is better
      result = await sql`
        UPDATE level_progress
        SET 
          completed = ${completed || existing[0].completed},
          stars = GREATEST(stars, ${stars}),
          best_wpm = GREATEST(best_wpm, ${wpm}),
          best_accuracy = GREATEST(best_accuracy, ${accuracy}),
          completed_at = CASE WHEN ${completed} AND completed_at IS NULL THEN NOW() ELSE completed_at END
        WHERE user_id = ${userId} AND mode = ${mode} AND level_number = ${level_number}
        RETURNING *
      `;
    } else {
      // Create new record
      result = await sql`
        INSERT INTO level_progress (user_id, mode, level_number, completed, stars, best_wpm, best_accuracy, completed_at)
        VALUES (${userId}, ${mode}, ${level_number}, ${completed || false}, ${stars}, ${wpm}, ${accuracy}, ${completed ? sql`NOW()` : null})
        RETURNING *
      `;
    }

    // If completed, unlock next level
    if (completed) {
      const nextLevel = level_number + 1;
      const nextExists = await sql`
        SELECT * FROM level_progress
        WHERE user_id = ${userId} AND mode = ${mode} AND level_number = ${nextLevel}
      `;

      if (nextExists.length === 0) {
        await sql`
          INSERT INTO level_progress (user_id, mode, level_number, completed, stars, best_wpm, best_accuracy)
          VALUES (${userId}, ${mode}, ${nextLevel}, false, 0, 0, 0)
        `;
      }
    }

    res.json({ progress: result[0] });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

/**
 * GET /api/progress/:userId/all
 * Get all progress across all modes
 */
router.get('/:userId/all', authenticate, async (req, res) => {
  try {
    const { userId } = req.params;

    // Only allow users to view their own progress or admins to view any
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await sql`
      SELECT 
        mode,
        COUNT(*) as total_levels,
        COUNT(CASE WHEN completed = true THEN 1 END) as completed_levels,
        SUM(stars) as total_stars,
        MAX(best_wpm) as max_wpm
      FROM level_progress
      WHERE user_id = ${userId}
      GROUP BY mode
    `;

    res.json({ progress });
  } catch (error) {
    console.error('Get all progress error:', error);
    res.status(500).json({ error: 'Failed to get progress' });
  }
});

module.exports = router;
