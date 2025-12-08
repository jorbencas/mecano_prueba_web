const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { authenticateToken, isAdmin } = require('../auth/middleware');

// Admin endpoint to get all users' activity data
router.get('/admin/activity', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { start, end } = req.query;
    
    // Get all users with their roles
    const users = await sql`
      SELECT id, email, role FROM users
    `;
    
    // For each user, return basic info
    // Activity data will be aggregated from localStorage on the frontend
    const usersData = users.map(user => ({
      userId: user.id,
      email: user.email,
      role: user.role || 'student',
      // These will be populated from localStorage on frontend
      totalTime: 0,
      totalActivities: 0,
      averageWPM: 0,
      averageAccuracy: 0,
      totalCompleted: 0,
      byComponent: {},
      byActivityType: {},
    }));
    
    res.json(usersData);
  } catch (error) {
    console.error('Error fetching admin activity data:', error);
    res.status(500).json({ error: 'Failed to fetch activity data' });
  }
});

// Admin endpoint to get a specific user's achievements
router.get('/admin/users/:userId/achievements', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify user exists
    const user = await sql`
      SELECT id, email FROM users WHERE id = ${userId}
    `;
    
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Get user's achievements from their data
    // Note: Achievements are stored in localStorage on client side
    // This endpoint returns user info, client will need to request achievements data
    res.json({
      userId: user[0].id,
      email: user[0].email,
      // Achievements will be fetched from localStorage on frontend
      achievements: []
    });
  } catch (error) {
    console.error('Error fetching user achievements:', error);
    res.status(500).json({ error: 'Failed to fetch user achievements' });
  }
});

// Admin endpoint to get achievement statistics across all users
router.get('/admin/achievements/stats', authenticateToken, isAdmin, async (req, res) => {
  try {
    // Get all users
    const users = await sql`
      SELECT id, email FROM users
    `;
    
    // Return basic stats structure
    // Actual achievement data will be aggregated on frontend from localStorage
    res.json({
      totalUsers: users.length,
      users: users.map(u => ({
        userId: u.id,
        email: u.email
      }))
    });
  } catch (error) {
    console.error('Error fetching achievement stats:', error);
    res.status(500).json({ error: 'Failed to fetch achievement statistics' });
  }
});

module.exports = router;
