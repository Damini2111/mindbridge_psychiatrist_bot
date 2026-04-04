const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Save game session
router.post('/session', authenticate, async (req, res) => {
    try {
        const { 
            gameType, 
            score, 
            durationSeconds, 
            levelReached, 
            movesCount, 
            completed, 
            stressReduction 
        } = req.body;
        const userId = req.user.userId || req.user.id;

        const [result] = await db.query(
            `INSERT INTO game_sessions (user_id, game_type, score, duration_seconds, level_reached, moves_count, completed, stress_reduction)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, gameType, score, durationSeconds, levelReached, movesCount, completed ? 1 : 0, stressReduction]
        );

        res.json({
            success: true,
            sessionId: result.insertId
        });
    } catch (error) {
        console.error('❌ MySQL Game Save Error:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to save game session' 
        });
    }
});

// Get game history
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const { gameType, limit = 20 } = req.query;

        let sql = 'SELECT * FROM game_sessions WHERE user_id = ?';
        let params = [userId];

        if (gameType) {
            sql += ' AND game_type = ?';
            params.push(gameType);
        }

        sql += ' ORDER BY played_at DESC LIMIT ?';
        params.push(parseInt(limit));

        const [history] = await db.query(sql, params);

        res.json({ success: true, data: history });
    } catch (error) {
        console.error('❌ MySQL Game History Error:', error.message);
        res.status(500).json({ success: false, data: [], message: 'Failed to fetch game history' });
    }
});

// Get game statistics
router.get('/stats', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [stats] = await db.query(
            'SELECT game_type, score, duration_seconds, stress_reduction FROM game_sessions WHERE user_id = ?',
            [userId]
        );

        const grouped = stats.reduce((acc, curr) => {
            if (!acc[curr.game_type]) {
                acc[curr.game_type] = { total_plays: 0, total_score: 0, best_score: 0, total_reduction: 0 };
            }
            acc[curr.game_type].total_plays++;
            acc[curr.game_type].total_score += curr.score;
            acc[curr.game_type].best_score = Math.max(acc[curr.game_type].best_score, curr.score || 0);
            acc[curr.game_type].total_reduction += (curr.stress_reduction || 0);
            return acc;
        }, {});

        res.json({ success: true, data: Object.keys(grouped).map(k => ({ game_type: k, ...grouped[k] })) });
    } catch (error) {
        console.error('❌ MySQL Game Stats Error:', error.message);
        res.status(500).json({ success: false, data: [] });
    }
});

module.exports = router;
