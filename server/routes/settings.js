const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../auth/middleware');

const router = express.Router();

/**
 * GET /api/settings
 * Get all global settings
 */
router.get('/', async (req, res) => {
  try {
    const settings = await sql`SELECT key, value FROM settings`;
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    res.json(settingsMap);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

/**
 * PUT /api/settings
 * Update global settings (Admin only)
 */
router.put('/', authenticate, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized: Admin access required' });
    }

    const updates = req.body; // { key: value }
    
    for (const [key, value] of Object.entries(updates)) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${value}, NOW())
        ON CONFLICT (key) DO UPDATE
        SET value = ${value}, updated_at = NOW()
      `;
    }

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

module.exports = router;
