const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Log stress level
router.post('/log', authenticate, async (req, res) => {
    try {
        const { stressLevel, mood, notes, triggers, activityContext, source = 'manual' } = req.body;
        const userId = req.user.userId || req.user.id;

        await db.query(
            `INSERT INTO stress_logs (user_id, score, source, mood, notes, triggers, activity_context) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, stressLevel, source, mood, notes, triggers, activityContext]
        );

        res.json({ success: true, message: 'Stress level logged' });
    } catch (error) {
        console.error('❌ MySQL Log Stress Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to log stress level' });
    }
});

// Get stress history
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { days = 30 } = req.query;

        const [history] = await db.query(
            `SELECT * FROM stress_logs 
             WHERE user_id = ? 
             ORDER BY logged_at DESC 
             LIMIT ?`,
            [userId, parseInt(days)]
        );

        res.json({ success: true, data: history });
    } catch (error) {
        console.error('❌ MySQL History Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch stress history', data: [] });
    }
});

// Get weekly stats
router.get('/weekly', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [weeklyData] = await db.query(
            `SELECT logged_at, score FROM stress_logs 
             WHERE user_id = ? 
             AND logged_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             ORDER BY logged_at ASC`,
            [userId]
        );

        res.json({ success: true, data: weeklyData });
    } catch (error) {
        console.error('❌ MySQL Weekly Stats Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch weekly stats', data: [] });
    }
});

// Get current (latest) stress level
router.get('/current', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [current] = await db.query(
            `SELECT * FROM stress_logs 
             WHERE user_id = ? 
             ORDER BY logged_at DESC 
             LIMIT 1`,
            [userId]
        );

        res.json({ success: true, data: current.length > 0 ? current[0] : null });
    } catch (error) {
        console.error('❌ MySQL Current Stress Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch current stress level', data: null });
    }
});

module.exports = router;
