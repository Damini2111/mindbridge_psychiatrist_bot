const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { authenticate, requireRole } = require('../middleware/auth');

// List all users
router.get('/users', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const [users] = await db.query(
            'SELECT id as user_id, email, display_name as full_name, role, is_active, created_at FROM users ORDER BY created_at DESC'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('❌ MySQL Admin Users Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch users' });
    }
});

// Enable/disable user
router.put('/users/:id/status', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { isActive } = req.body;
        await db.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ MySQL Status Update Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update user status' });
    }
});

// Change user role
router.put('/users/:id/role', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const { role } = req.body;
        await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
        res.json({ success: true });
    } catch (error) {
        console.error('❌ MySQL Role Update Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to update user role' });
    }
});

// Get all emergency alerts
router.get('/alerts', authenticate, requireRole('admin'), async (req, res) => {
    try {
        const [alerts] = await db.query(
            `SELECT ea.*, u.display_name as full_name, u.email 
             FROM emergency_alerts ea
             JOIN users u ON ea.user_id = u.id
             ORDER BY ea.notified_at DESC LIMIT 50`
        );
        res.json({ success: true, data: alerts });
    } catch (error) {
        console.error('❌ MySQL Admin Alerts Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to fetch alerts' });
    }
});

module.exports = router;