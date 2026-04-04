const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

/**
 * ── MEDICAL HISTORY & CLINICAL DATA (MYSQL) ───────────────────────────
 */

// Get user's full medical history
router.get('/history', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const [data] = await db.query(
            'SELECT * FROM medical_history WHERE user_id = ? ORDER BY created_at DESC',
            [userId]
        );

        res.json({ success: true, data });
    } catch (error) {
        console.error('❌ MySQL Medical History Error:', error.message);
        res.status(500).json({ success: false, data: [], message: 'Failed to fetch medical history' });
    }
});

// Add a new medical record
router.post('/record', authenticate, async (req, res) => {
    try {
        const { condition, diagnosed_by, notes, status = 'Active', diagnosed_date } = req.body;
        const userId = req.user.userId || req.user.id;

        const [result] = await db.query(
            `INSERT INTO medical_history (user_id, \`condition\`, diagnosed_by, notes, status, diagnosed_date)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [userId, condition, diagnosed_by, notes, status, diagnosed_date]
        );

        const [newRecord] = await db.query('SELECT * FROM medical_history WHERE id = ?', [result.insertId]);

        res.json({ success: true, data: newRecord[0] });
    } catch (error) {
        console.error('❌ MySQL Medical Record Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to save record' });
    }
});

// Get medication records
router.get('/medication', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;
        const [data] = await db.query(
            'SELECT * FROM medications WHERE user_id = ?',
            [userId]
        );

        res.json({ success: true, data });
    } catch (error) {
        console.error('❌ MySQL Medication Error:', error.message);
        res.status(500).json({ success: false, data: [], message: 'Failed to fetch medications' });
    }
});

// Update/Sync full medical history from profile
router.put('/sync', authenticate, async (req, res) => {
    try {
        const { conditions, medications, allergies, previousTherapy, notes } = req.body;
        const userId = req.user.userId || req.user.id;

        // We treat this as an upsert to a "primary" record for the user
        // Check if a record exists
        const [existing] = await db.query('SELECT id FROM medical_history WHERE user_id = ? LIMIT 1', [userId]);

        if (existing.length > 0) {
            await db.query(
                `UPDATE medical_history SET 
                 \`condition\` = ?, medications = ?, allergies = ?, previous_therapy = ?, notes = ?
                 WHERE id = ?`,
                [conditions, medications, allergies, previousTherapy, notes, existing[0].id]
            );
        } else {
            await db.query(
                `INSERT INTO medical_history (user_id, \`condition\`, medications, allergies, previous_therapy, notes)
                 VALUES (?, ?, ?, ?, ?, ?)`,
                [userId, conditions, medications, allergies, previousTherapy, notes]
            );
        }

        res.json({ success: true, message: 'Medical history synchronized' });
    } catch (error) {
        console.error('❌ MySQL Medical Sync Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to sync medical history' });
    }
});

module.exports = router;
