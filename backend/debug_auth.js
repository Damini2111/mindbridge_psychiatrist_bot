const db = require('./config/database');

async function debug() {
    try {
        console.log('--- 🛡️ MindBridge Auth Debugger ---');
        
        // 1. Check Schema
        console.log('\n📊 Checking users table schema...');
        const [columns] = await db.query('SHOW COLUMNS FROM users');
        console.table(columns.map(c => ({ Field: c.Field, Type: c.Type, Null: c.Null })));

        // 2. Test Registration Query with typical frontend payload
        console.log('\n🧪 Testing registration query with minimal payload...');
        const email = `test_${Date.now()}@example.com`;
        const passHash = 'fake_hash';
        const displayName = 'Test User';
        const role = 'user';
        
        // These are the fields I added recently
        const phone = undefined;
        const gender = undefined;
        const dob = undefined;
        const psychiatristId = null;

        try {
            const [result] = await db.query(
                'INSERT INTO users (email, password_hash, display_name, role, phone, gender, dob, psychiatrist_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [email, passHash, displayName, role, phone, gender, dob, psychiatristId]
            );
            console.log('✅ Minimal INSERT Successful! ID:', result.insertId);
            
            // Cleanup
            await db.query('DELETE FROM users WHERE id = ?', [result.insertId]);
            console.log('🧹 Test user cleaned up.');
        } catch (err) {
            console.error('❌ Minimal INSERT Failed:', err.message);
            console.log('\n💡 Tip: If this failed with "Incorrect date value", we need to handle undefined/empty strings better.');
        }

        process.exit(0);
    } catch (err) {
        console.error('💥 Debugger Error:', err);
        process.exit(1);
    }
}

debug();
