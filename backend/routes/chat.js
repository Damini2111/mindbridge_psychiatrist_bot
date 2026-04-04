const express = require('express');
const router = express.Router();
const db = require('../config/database');
const http = require('http');
const { authenticate } = require('../middleware/auth');

/**
 * ── OLLAMA LOCAL AI INTEGRATION (ATOMIC PULSE-OLLAMA v1.0) ──────────────────
 */

const callOllama = (model, systemPrompt, userMessage, images = []) => {
    return new Promise((resolve, reject) => {
        const payload = {
            model: model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage, images: images }
            ],
            stream: false
        };
        const data = JSON.stringify(payload);
        
        const options = {
            hostname: 'localhost',
            port: 11434,
            path: '/api/chat',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    if (res.statusCode === 200) resolve(parsed.message.content);
                    else reject(new Error(`Ollama Error ${res.statusCode}: ${parsed.error || 'Unknown error'}`));
                } catch (e) {
                    reject(new Error("Failed to parse Ollama response"));
                }
            });
        });

        req.on('error', (e) => {
            reject(new Error(`Ollama Connection Failed: ${e.message}. Is Ollama running?`));
        });

        req.setTimeout(120000, () => {
            req.destroy();
            reject(new Error("Ollama Request Timed Out - Your computer is thinking..."));
        });

        req.write(data);
        req.end();
    });
};

/**
 * ── AURA SESSIONS ──────────────────────────────────────────────────────────
 */

router.post('/session/start', authenticate, async (req, res) => {
    try {
        const { moodBefore, stressLevelBefore } = req.body;
        const userId = req.user.userId || req.user.id;

        const [result] = await db.query(
            'INSERT INTO chat_sessions (user_id, avg_stress_score) VALUES (?, ?)',
            [userId, stressLevelBefore]
        );

        res.json({ success: true, sessionId: result.insertId });
    } catch (error) {
        console.error('❌ MySQL Session Start Error:', error.message);
        res.status(500).json({ success: false, message: 'Failed to start neural session' });
    }
});

/**
 * ── AURA VISION SCAN (OLLAMA LLAVA-SYNC) ───────────────────────────────────
 */
router.post('/scan', authenticate, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) return res.status(400).json({ success: false, message: 'Bio-data required' });
        const base64Data = image.split(',')[1];
        const userId = req.user.userId || req.user.id;
        
        let analysis;
        try {
            console.log("🤖 Scanning with Ollama (Llava)...");
            const systemPrompt = "Analyze person's emotion and stress. Return ONLY a JSON object: {\"mood\": \"string\", \"stress\": 0-100, \"recommendation\": \"string\", \"insight\": \"string\"}. Do not talk, just JSON.";
            const userMsg = "Analyze this image.";
            
            let aiRes;
            try {
                aiRes = await callOllama('llava', systemPrompt, userMsg, [base64Data]);
            } catch (e) {
                aiRes = await callOllama('llava:latest', systemPrompt, userMsg, [base64Data]);
            }
            
            const jsonMatch = aiRes.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error("No JSON found in AI response");
            
            analysis = JSON.parse(jsonMatch[0].trim());
            console.log("✅ OLLAMA VISION SUCCESS");
        } catch (e) {
            console.warn("⚠️ Vision AI parse failed, using fallback:", e.message);
            analysis = { mood: "Unknown", stress: 50, recommendation: "Relax and breath", insight: `Local AI Analysis` };
        }

        // Save to stress_logs
        await db.query(
            `INSERT INTO stress_logs (user_id, score, source, mood, notes) 
             VALUES (?, ?, 'face', ?, ?)`,
            [userId, analysis.stress, analysis.mood, analysis.insight]
        );

        res.json({ success: true, analysis });
    } catch (error) {
        console.error('Scan Error:', error.message);
        res.status(500).json({ success: false, message: "Interface resonance lost." });
    }
});

/**
 * ── AURA CHATBOT (OLLAMA TINYLLAMA-SYNC) ──────────────────────────────────
 */
router.post('/ai', authenticate, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user.userId || req.user.id;
        if (!message) return res.status(400).json({ success: false, message: 'Neural input missing' });

        // 1. Save User Message
        if (sessionId) {
            await db.query(
                'INSERT INTO messages (session_id, sender, content) VALUES (?, ?, ?)',
                [sessionId, 'user', message]
            );
        }

        let reply;
        try {
            console.log("🤖 Thinking with Ollama...");
            const systemPrompt = "You are Aura, a professional psychiatrist. Be clinical, empathetic, and direct. Respond only to the user's message and stay in character.";
            
            let modelsToTry = ['phi3', 'llama3', 'mistral', 'tinyllama'];
            for (let modelName of modelsToTry) {
                try {
                    reply = await callOllama(modelName, systemPrompt, message);
                    break;
                } catch (e) { continue; }
            }

            if (!reply) throw new Error("No neural model found");
        } catch (aiErr) {
            reply = `Neural Link Buffered: I am listening. [Diagnostic: ${aiErr.message}]`;
        }

        // 2. Save Bot Reply
        if (sessionId) {
            await db.query(
                'INSERT INTO messages (session_id, sender, content) VALUES (?, ?, ?)',
                [sessionId, 'bot', reply]
            );
        }

        res.json({ success: true, reply: reply.trim() });
    } catch (error) {
        console.error('Chat AI Error:', error.message);
        res.json({ success: true, reply: "I am listening. Re-establishing local neural bridge..." });
    }
});

module.exports = router;

module.exports = router;