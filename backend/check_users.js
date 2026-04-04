const mysql = require('mysql2/promise');
require('dotenv').config();

async function check() {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT
    });

    try {
        const [columns] = await db.query('DESCRIBE users');
        console.log(JSON.stringify(columns, null, 2));
    } catch (err) {
        console.error('❌ Error:', err.message);
    } finally {
        await db.end();
    }
}
check();
