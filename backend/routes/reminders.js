const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticate } = require('../middleware/auth');

// Create reminder
router.post('/', authenticate, async (req, res) => {
    try {
        const { title, description, reminderTime, reminderDays, icon, color } = req.body;
        const userId = req.user.userId || req.user.id;

        const [result] = await db.query(
            `INSERT INTO therapy_reminders (user_id, title, description, reminder_time, reminder_days, icon, color)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [userId, title, description, reminderTime, reminderDays || 'Daily', icon || '🔔', color]
        );

        res.json({
            success: true,
            message: 'Reminder created',
            reminderId: result.insertId
        });
    } catch (error) {
        console.error('❌ MySQL Create Reminder Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to create reminder' });
    }
});

// Get all reminders
router.get('/', authenticate, async (req, res) => {
    try {
        const userId = req.user.userId || req.user.id;

        const [reminders] = await db.query(
            'SELECT * FROM therapy_reminders WHERE user_id = ? ORDER BY reminder_time ASC',
            [userId]
        );

        res.json({ success: true, data: reminders });
    } catch (error) {
        console.error('❌ MySQL Get Reminders Error:', error.message);
        res.status(500).json({ success: false, data: [], message: 'Failed to fetch reminders' });
    }
});

// Update reminder
router.put('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;
        const { title, description, reminderTime, reminderDays, icon, color, isActive } = req.body;

        await db.query(
            `UPDATE therapy_reminders 
             SET title = ?, description = ?, reminder_time = ?, reminder_days = ?, icon = ?, color = ?, is_active = ?
             WHERE id = ? AND user_id = ?`,
            [title, description, reminderTime, reminderDays, icon, color, isActive ? 1 : 0, id, userId]
        );

        res.json({ success: true, message: 'Reminder updated' });
    } catch (error) {
        console.error('❌ MySQL Update Reminder Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update reminder' });
    }
});

// Delete reminder
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId || req.user.id;

        await db.query(
            'DELETE FROM therapy_reminders WHERE id = ? AND user_id = ?',
            [id, userId]
        );

        res.json({ success: true, message: 'Reminder deleted' });
    } catch (error) {
        console.error('❌ MySQL Delete Reminder Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to delete reminder' });
    }
});

module.exports = router;