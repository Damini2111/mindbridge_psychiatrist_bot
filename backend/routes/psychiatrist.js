const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// Get all patients with status
router.get('/patients', authenticate, requireRole('psychiatrist', 'admin'), async (req, res) => {
    try {
        const [patients] = await db.query(
            `SELECT u.id as user_id, u.display_name as full_name, u.email, u.phone, u.gender, u.dob, u.can_message 
             FROM users u WHERE u.role = 'user'`
        );
        res.json({ success: true, data: patients });
    } catch (error) {
        console.error('❌ MySQL Patients Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch patients' });
    }
});

// Get one patient's medical history
router.get('/patients/:id/medical-history', authenticate, requireRole('psychiatrist', 'admin'), async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT * FROM medical_history WHERE user_id = ? ORDER BY created_at DESC',
            [req.params.id]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('❌ MySQL Medical History Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch medical history' });
    }
});

// Toggle patient messaging
router.put('/patients/:id/toggle-messaging', authenticate, requireRole('psychiatrist', 'admin'), async (req, res) => {
    try {
        const { can_message } = req.body;
        await db.query('UPDATE users SET can_message = ? WHERE id = ?', [can_message ? 1 : 0, req.params.id]);
        res.json({ success: true, message: 'Messaging preference updated' });
    } catch (error) {
        console.error('❌ Messaging Toggle Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update messaging preference' });
    }
});

// Get one patient's full stress history
router.get('/patients/:id/stress', authenticate, requireRole('psychiatrist', 'admin'), async (req, res) => {
    try {
        const [history] = await db.query(
            'SELECT score as stress_level, logged_at as recorded_date, source FROM stress_logs WHERE user_id = ? ORDER BY logged_at DESC LIMIT 30',
            [req.params.id]
        );
        res.json({ success: true, data: history });
    } catch (error) {
        console.error('❌ MySQL Patient Stress Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch stress history' });
    }
});

// Get emergency alerts
router.get('/alerts', authenticate, requireRole('psychiatrist', 'admin'), async (req, res) => {
    try {
        const [alerts] = await db.query(
            `SELECT ea.*, u.display_name as full_name FROM emergency_alerts ea JOIN users u ON ea.user_id = u.id`
        );
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('❌ MySQL Alerts Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
});

module.exports = router;