const mysql = require('mysql2/promise');
require('dotenv').config({ path: 'c:/Users/ipshi/OneDrive/Documents/aura/backend/.env' });

async function checkTable() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [rows] = await pool.query('DESCRIBE users');
        console.log('✅ Users Table Structure:');
        console.table(rows);
    } catch (err) {
        console.error('❌ Error describing users table:', err.message);
    } finally {
        await pool.end();
    }
}

checkTable();
