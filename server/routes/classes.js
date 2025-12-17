const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { authenticateToken } = require('../auth/middleware');

// Helper to generate random invite code
const generateInviteCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Middleware to check if user is a teacher
const isTeacher = async (req, res, next) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Only teachers can perform this action' });
  }
  next();
};

// GET /api/classes - List classes (Teacher: created classes, Student: joined classes)
router.get('/', authenticateToken, async (req, res) => {
  try {
    let classes;
    if (req.user.role === 'admin') {
      // Admin sees ALL classes with teacher info
      classes = await sql`
        SELECT c.*, COUNT(cm.student_id) as student_count, u.display_name as teacher_name, u.email as teacher_email
        FROM classes c
        LEFT JOIN class_members cm ON c.id = cm.class_id
        LEFT JOIN users u ON c.teacher_id = u.id
        GROUP BY c.id, u.id
        ORDER BY c.created_at DESC
      `;
    } else if (req.user.role === 'teacher') {
      // Get classes created by teacher
      classes = await sql`
        SELECT c.*, COUNT(cm.student_id) as student_count
        FROM classes c
        LEFT JOIN class_members cm ON c.id = cm.class_id
        WHERE c.teacher_id = ${req.user.id}
        GROUP BY c.id
        ORDER BY c.created_at DESC
      `;
    } else {
      // Get classes student has joined
      classes = await sql`
        SELECT c.*, u.display_name as teacher_name
        FROM classes c
        JOIN class_members cm ON c.id = cm.class_id
        JOIN users u ON c.teacher_id = u.id
        WHERE cm.student_id = ${req.user.id}
        ORDER BY cm.joined_at DESC
      `;
    }
    res.json(classes);
  } catch (error) {
    console.error('Error fetching classes:', error);
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
});

// POST /api/classes - Create a new class (Teacher only)
router.post('/', authenticateToken, isTeacher, async (req, res) => {
  const { name, description } = req.body;
  
  if (!name) {
    return res.status(400).json({ error: 'Class name is required' });
  }

  try {
    let inviteCode;
    let isUnique = false;
    
    // Generate unique invite code
    while (!isUnique) {
      inviteCode = generateInviteCode();
      const existing = await sql`SELECT id FROM classes WHERE invite_code = ${inviteCode}`;
      if (existing.length === 0) isUnique = true;
    }

    const [newClass] = await sql`
      INSERT INTO classes (teacher_id, name, description, invite_code)
      VALUES (${req.user.id}, ${name}, ${description}, ${inviteCode})
      RETURNING *
    `;

    res.status(201).json(newClass);
  } catch (error) {
    console.error('Error creating class:', error);
    res.status(500).json({ error: 'Failed to create class' });
  }
});

// POST /api/classes/join - Join a class with code
router.post('/join', authenticateToken, async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'Invite code is required' });
  }

  try {
    // Find class
    const [classToJoin] = await sql`
      SELECT * FROM classes WHERE invite_code = ${code.toUpperCase()} AND is_active = true
    `;

    if (!classToJoin) {
      return res.status(404).json({ error: 'Invalid or inactive invite code' });
    }

    // Check if already joined
    const [existingMember] = await sql`
      SELECT * FROM class_members 
      WHERE class_id = ${classToJoin.id} AND student_id = ${req.user.id}
    `;

    if (existingMember) {
      return res.status(400).json({ error: 'You are already a member of this class' });
    }

    // Join class
    await sql`
      INSERT INTO class_members (class_id, student_id)
      VALUES (${classToJoin.id}, ${req.user.id})
    `;

    res.json({ message: 'Successfully joined class', class: classToJoin });
  } catch (error) {
    console.error('Error joining class:', error);
    res.status(500).json({ error: 'Failed to join class' });
  }
});

// GET /api/classes/:id - Get class details
router.get('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    // Check access rights
    const [classData] = await sql`
      SELECT c.*, 
        CASE WHEN c.teacher_id = ${req.user.id} THEN true ELSE false END as is_teacher
      FROM classes c
      WHERE c.id = ${id}
    `;

    if (!classData) {
      return res.status(404).json({ error: 'Class not found' });
    }

    // Verify membership if not teacher
    if (!classData.is_teacher) {
      const [membership] = await sql`
        SELECT * FROM class_members WHERE class_id = ${id} AND student_id = ${req.user.id}
      `;
      if (!membership) {
        return res.status(403).json({ error: 'Not a member of this class' });
      }
    }

    // Get members if teacher
    if (classData.is_teacher) {
      const members = await sql`
        SELECT u.id, u.display_name, u.email, u.photo_url, cm.joined_at
        FROM class_members cm
        JOIN users u ON cm.student_id = u.id
        WHERE cm.class_id = ${id}
        ORDER BY u.display_name
      `;
      classData.members = members;
    }

    res.json(classData);
  } catch (error) {
    console.error('Error fetching class details:', error);
    res.status(500).json({ error: 'Failed to fetch class details' });
  }
});

module.exports = router;
