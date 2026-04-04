const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * ── AUTH SYSTEM (MYSQL v1.0) ─────────────────────────────────────────────
 */

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, email: user.email, role: user.role || 'user' },
        process.env.JWT_SECRET || 'demo_secret',
        { expiresIn: '7d' }
    );
};

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { email, password, display_name, role = 'user' } = req.body;
        
        // Sanitize optional fields
        const phone = req.body.phone || null;
        const gender = req.body.gender || null;
        const dob = req.body.dob || null;
        
        // Optional psychiatrist linking from token
        let psychiatristId = null;
        const authHeader = req.headers.authorization;
        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret');
                if (decoded.role === 'psychiatrist') psychiatristId = decoded.id;
            } catch (e) {}
        }
        
        if (!email || !password || !display_name) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        // Check if user already exists
        const [existingUsers] = await db.query('SELECT id, psychiatrist_id FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            if (psychiatristId) {
                // Update existing user and link to this psychiatrist
                await db.query(
                    'UPDATE users SET display_name = ?, phone = ?, gender = ?, dob = ?, psychiatrist_id = ? WHERE email = ?',
                    [display_name, phone, gender, dob, psychiatristId, email]
                );
                return res.json({ success: true, message: 'Patient profile updated and linked', user: { id: existingUsers[0].id, email, display_name, role } });
            }
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        // Insert new user
        const [result] = await db.query(
            'INSERT INTO users (email, password_hash, display_name, role, phone, gender, dob, psychiatrist_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [email, passwordHash, display_name, role, phone, gender, dob, psychiatristId]
        );

        const userId = result.insertId;
        const newUser = { id: userId, email, display_name, role };
        const token = generateToken(newUser);

        res.status(201).json({ success: true, token, user: newUser });
    } catch (error) {
        console.error("❌ MySQL Register Error:", error.message);
        res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
    }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (!users.length) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user);
        
        // Remove password hash from response
        delete user.password_hash;
        
        res.json({ success: true, token, user });
    } catch (error) {
        console.error("❌ MySQL Login Error:", error.message);
        res.status(500).json({ success: false, message: 'Login failed', error: error.message });
    }
});

// ── VERIFY ────────────────────────────────────────────────────────────────────
router.get('/verify', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ success: false, message: 'Unauthorized' });

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'demo_secret');
        
        const [users] = await db.query(
            'SELECT id, email, display_name, role FROM users WHERE id = ?',
            [decoded.id]
        );

        if (!users.length) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }
        
        res.json({ success: true, user: users[0] });
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid session' });
    }
});

module.exports = router;