
const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Start therapy session
router.post('/session/start', authenticate, async (req, res) => {
    try {
        const { exerciseType, stressBefore } = req.body;
        const userId = req.user.userId || req.user.id;

        const [result] = await db.query(
            `INSERT INTO therapy_sessions 
            (user_id, exercise_type, stress_before, started_at)
            VALUES (?, ?, ?, NOW())`,
            [userId, exerciseType, stressBefore]
        );

        res.json({
            success: true,
            sessionId: result.insertId
        });
    } catch (error) {
        console.error('Start therapy error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to start session' 
        });
    }
});

// End therapy session
router.put('/session/end', authenticate, async (req, res) => {
    try {
        const { sessionId, durationSeconds, stressAfter, completionPercentage, notes } = req.body;
        const userId = req.user.userId || req.user.id;

        await db.query(
            `UPDATE therapy_sessions 
            SET duration_seconds = ?, stress_after = ?, 
                completion_percentage = ?, notes = ?,
                completed = TRUE, completed_at = NOW()
            WHERE id = ? AND user_id = ?`,
            [durationSeconds, stressAfter, completionPercentage, notes, sessionId, userId]
        );

        res.json({ success: true, message: 'Session ended' });
    } catch (error) {
        console.error('End therapy error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to end session' 
        });
    }
});

// Get therapy history
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { limit = 20 } = req.query;

        const [history] = await db.query(
            `SELECT * FROM therapy_sessions 
            WHERE user_id = ? 
            ORDER BY started_at DESC 
            LIMIT ?`,
            [userId, parseInt(limit)]
        );

        res.json({ success: true, data: history });
    } catch (error) {
        console.error('Get therapy history error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch history' 
        });
    }
});

// Get therapy statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [stats] = await db.query(
            `SELECT 
                exercise_type,
                COUNT(*) as total_sessions,
                AVG(duration_seconds) as avg_duration,
                AVG(stress_before - stress_after) as avg_stress_reduction,
                SUM(CASE WHEN completed = TRUE THEN 1 ELSE 0 END) as completed_sessions
            FROM therapy_sessions
            WHERE user_id = ?
            GROUP BY exercise_type`,
            [userId]
        );

        res.json({ success: true, data: stats });
    } catch (error) {
        console.error('Get therapy stats error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to fetch stats' 
        });
    }
});

module.exports = router;
