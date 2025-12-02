const express = require('express');
const { sql } = require('../db');
const { authenticate } = require('../auth/middleware');

const router = express.Router();

/**
 * Middleware to check if user is admin
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, display_name, photo_url, role, created_at, last_login
      FROM users
      ORDER BY created_at DESC
    `;

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * PATCH /api/users/:userId
 * Update user details (admin only)
 */
router.patch('/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { email, display_name, role } = req.body;

    // Prevent admin from changing their own role
    if (userId === req.user.id && role && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    // Validate role if provided
    if (role && !['admin', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Get current user data
    const currentUser = await sql`SELECT * FROM users WHERE id = ${userId}`;
    if (currentUser.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Use current values if not provided
    const updatedEmail = email !== undefined ? email : currentUser[0].email;
    const updatedDisplayName = display_name !== undefined ? display_name : currentUser[0].display_name;
    const updatedRole = role !== undefined ? role : currentUser[0].role;

    const result = await sql`
      UPDATE users
      SET email = ${updatedEmail},
          display_name = ${updatedDisplayName},
          role = ${updatedRole},
          updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, display_name, photo_url, role, created_at, last_login
    `;

    // Log the change
    const changes = {};
    if (email !== undefined && email !== currentUser[0].email) changes.email = { from: currentUser[0].email, to: email };
    if (display_name !== undefined && display_name !== currentUser[0].display_name) changes.display_name = { from: currentUser[0].display_name, to: display_name };
    if (role !== undefined && role !== currentUser[0].role) changes.role = { from: currentUser[0].role, to: role };

    await sql`
      INSERT INTO audit_logs (admin_user_id, action, target_user_id, target_user_email, changes)
      VALUES (${req.user.id}, 'UPDATE_USER', ${userId}, ${currentUser[0].email}, ${JSON.stringify(changes)})
    `;

    res.json({ user: result[0] });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

/**
 * PATCH /api/users/:userId/role
 * Update user role (admin only)
 */
router.patch('/:userId/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['admin', 'student'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    // Prevent admin from demoting themselves
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    const result = await sql`
      UPDATE users
      SET role = ${role}, updated_at = NOW()
      WHERE id = ${userId}
      RETURNING id, email, display_name, role
    `;

    if (result.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result[0] });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
});

/**
 * DELETE /api/users/:userId
 * Delete user (admin only)
 */
router.delete('/:userId', authenticate, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user info before deletion for audit log
    const userToDelete = await sql`SELECT email, display_name FROM users WHERE id = ${userId}`;
    
    if (userToDelete.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Log the deletion
    await sql`
      INSERT INTO audit_logs (admin_user_id, action, target_user_id, target_user_email, changes)
      VALUES (${req.user.id}, 'DELETE_USER', ${userId}, ${userToDelete[0].email}, ${JSON.stringify({ deleted_user: userToDelete[0] })})
    `;

    await sql`
      DELETE FROM users
      WHERE id = ${userId}
    `;

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

/**
 * GET /api/users/audit-logs
 * Get audit logs (admin only)
 */
router.get('/audit-logs', authenticate, requireAdmin, async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const logs = await sql`
      SELECT 
        al.*,
        u.email as admin_email,
        u.display_name as admin_name
      FROM audit_logs al
      LEFT JOIN users u ON al.admin_user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.json({ logs });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to get audit logs' });
  }
});

module.exports = router;
