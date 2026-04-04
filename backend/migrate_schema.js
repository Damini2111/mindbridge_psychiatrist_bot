const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        console.log('🔄 Starting Database Schema Synchronization...');

        // 1. Check users table
        const [userCols] = await db.query('DESCRIBE users');
        const hasUserId = userCols.some(c => c.Field === 'user_id');
        const hasId = userCols.some(c => c.Field === 'id');

        if (hasUserId && !hasId) {
            console.log('📦 Renaming users.user_id to users.id...');
            await db.query('ALTER TABLE users CHANGE COLUMN user_id id INT AUTO_INCREMENT');
            console.log('✅ Renamed users.user_id to users.id');
        } else {
            console.log('⏭️ users table already has "id" or no "user_id" found.');
        }

        // 2. Check full_name vs display_name
        const [latestUserCols] = await db.query('DESCRIBE users');
        const hasFullName = latestUserCols.some(c => c.Field === 'full_name');
        const hasDisplayName = latestUserCols.some(c => c.Field === 'display_name');

        if (hasFullName && !hasDisplayName) {
            console.log('📦 Renaming users.full_name to users.display_name...');
            await db.query('ALTER TABLE users CHANGE COLUMN full_name display_name VARCHAR(255)');
            console.log('✅ Renamed users.full_name to users.display_name');
        }

        // 3. Ensure psychiatrist_id exists
        const hasPsychId = latestUserCols.some(c => c.Field === 'psychiatrist_id');
        if (!hasPsychId) {
            console.log('📦 Adding users.psychiatrist_id...');
            await db.query('ALTER TABLE users ADD COLUMN psychiatrist_id INT NULL');
            await db.query('ALTER TABLE users ADD FOREIGN KEY (psychiatrist_id) REFERENCES users(id) ON DELETE SET NULL');
            console.log('✅ Added users.psychiatrist_id');
        }

        // 4. Align other tables...
        const tablesToFix = ['chat_sessions', 'messages', 'stress_logs', 'quiz_results', 'therapy_reminders', 'medical_history', 'medications', 'game_sessions', 'therapy_sessions'];
        
        const [tables] = await db.query('SHOW TABLES');
        const dbName = process.env.DB_NAME;
        const tableNameKey = `Tables_in_${dbName}`;
        const existingTableNames = tables.map(t => t[tableNameKey]);

        for (const table of tablesToFix) {
            if (existingTableNames.includes(table)) {
                const [cols] = await db.query(`DESCRIBE ${table}`);
                const idCol = table === 'messages' ? 'message_id' : (table === 'chat_sessions' ? 'session_id' : `${table.slice(0, -1)}_id`);
                // Generic check for common variations
                const hasWrongId = cols.some(c => c.Field.endsWith('_id') && c.Key === 'PRI');
                const hasCorrectId = cols.some(c => c.Field === 'id');

                if (hasWrongId && !hasCorrectId) {
                    const wrongName = cols.find(c => c.Key === 'PRI').Field;
                    console.log(`📦 Renaming ${table}.${wrongName} to ${table}.id...`);
                    await db.query(`ALTER TABLE ${table} CHANGE COLUMN ${wrongName} id INT AUTO_INCREMENT`);
                    console.log(`✅ Fixed ${table} primary key.`);
                }
            }
        }

        console.log('✨ Schema Synchronization Complete!');
    } catch (err) {
        console.error('❌ Migration Error:', err.message);
    } finally {
        await db.end();
    }
}

migrate();
