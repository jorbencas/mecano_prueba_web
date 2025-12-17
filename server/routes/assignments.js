const express = require('express');
const router = express.Router();
const { sql } = require('../db');
const { authenticateToken } = require('../auth/middleware');

// Middleware to check if user is teacher of the class
const isClassTeacher = async (req, res, next) => {
  const classId = req.body.classId || req.params.classId;
  
  if (!classId) return next(); // Let route handler handle missing param

  try {
    const [cls] = await sql`SELECT teacher_id FROM classes WHERE id = ${classId}`;
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    
    if (cls.teacher_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// GET /api/assignments/class/:classId - List assignments for a class
router.get('/class/:classId', authenticateToken, async (req, res) => {
  const { classId } = req.params;

  try {
    // Check membership or ownership
    const [access] = await sql`
      SELECT 1 FROM classes c
      LEFT JOIN class_members cm ON c.id = cm.class_id
      WHERE c.id = ${classId} 
      AND (c.teacher_id = ${req.user.id} OR cm.student_id = ${req.user.id})
    `;

    if (!access) {
      return res.status(403).json({ error: 'Not authorized to view assignments for this class' });
    }

    const assignments = await sql`
      SELECT a.*, 
        (SELECT COUNT(*) FROM assignment_results ar WHERE ar.assignment_id = a.id AND ar.student_id = ${req.user.id}) as completed
      FROM assignments a
      WHERE a.class_id = ${classId}
      ORDER BY a.due_date ASC, a.created_at DESC
    `;

    res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ error: 'Failed to fetch assignments' });
  }
});

// POST /api/assignments - Create new assignment (Teacher only)
router.post('/', authenticateToken, isClassTeacher, async (req, res) => {
  const { classId, title, description, type, config, requirements, dueDate } = req.body;

  if (!classId || !title || !type) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const [assignment] = await sql`
      INSERT INTO assignments (class_id, title, description, type, config, requirements, due_date)
      VALUES (${classId}, ${title}, ${description}, ${type}, ${config}, ${requirements}, ${dueDate})
      RETURNING *
    `;

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ error: 'Failed to create assignment' });
  }
});

// POST /api/assignments/:id/complete - Mark assignment as completed
router.post('/:id/complete', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { wpm, accuracy, score } = req.body;

  try {
    const [assignment] = await sql`SELECT * FROM assignments WHERE id = ${id}`;
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check requirements
    const reqs = assignment.requirements || {};
    const passed = (!reqs.minWpm || wpm >= reqs.minWpm) && 
                   (!reqs.minAccuracy || accuracy >= reqs.minAccuracy);

    // Record result
    const [result] = await sql`
      INSERT INTO assignment_results (assignment_id, student_id, wpm, accuracy, score, passed)
      VALUES (${id}, ${req.user.id}, ${wpm}, ${accuracy}, ${score}, ${passed})
      ON CONFLICT (assignment_id, student_id) 
      DO UPDATE SET 
        wpm = EXCLUDED.wpm,
        accuracy = EXCLUDED.accuracy,
        score = EXCLUDED.score,
        passed = EXCLUDED.passed,
        attempts = assignment_results.attempts + 1,
        completed_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    res.json({ message: 'Assignment completed', result, passed });
  } catch (error) {
    console.error('Error completing assignment:', error);
    res.status(500).json({ error: 'Failed to complete assignment' });
  }
});

module.exports = router;
